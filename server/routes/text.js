import express from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { upload, outputsPath } from '../middleware/upload.js';
import { checkFileSecurity } from '../middleware/fileSecurity.js';
import { recordConversion } from '../utils/stats.js';

const router = express.Router();

// 텍스트 파일 메모리 처리 제한
const TEXT_MAX_PARSE_SIZE = 10 * 1024 * 1024;  // 10MB: 이 이상은 메모리에 통째로 올리지 않음
const XLSX_MAX_ROWS = 100_000;                  // XLSX Bomb 방어: 행 수 제한

function checkTextFileSize(filePath, res) {
  const stat = fs.statSync(filePath);
  if (stat.size > TEXT_MAX_PARSE_SIZE) {
    fs.unlinkSync(filePath);
    res.status(400).json({
      error: `파일이 너무 큽니다. 텍스트 변환은 최대 ${TEXT_MAX_PARSE_SIZE / 1024 / 1024}MB까지 지원합니다.`,
    });
    return false;
  }
  return true;
}

// Helper: Parse CSV string to array of objects
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length === 0) return [];

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ',';

  const headers = parseCSVLine(lines[0], delimiter);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i], delimiter);
    const row = {};
    headers.forEach((header, idx) => {
      row[header.trim()] = values[idx] !== undefined ? values[idx].trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line, delimiter = ',') {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Helper: Convert array of objects to CSV string
function objectsToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvLines = [headers.join(',')];

  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h] === null || row[h] === undefined ? '' : String(row[h]);
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvLines.push(values.join(','));
  }

  return csvLines.join('\n');
}

// POST /api/text/csv-to-json
router.post('/csv-to-json', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!checkTextFileSize(req.file.path, res)) return;

  try {
    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const data = parseCSV(csvContent);

    const jsonString = JSON.stringify(data, null, 2);
    const outputFilename = `${uuidv4()}.json`;
    const outputPath = path.join(outputsPath, outputFilename);
    fs.writeFileSync(outputPath, jsonString, 'utf-8');

    fs.unlinkSync(req.file.path);
    const stats = fs.statSync(outputPath);

    recordConversion('csv_to_json');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      rows: data.length,
      columns: data.length > 0 ? Object.keys(data[0]).length : 0,
      preview: data.slice(0, 3),
    });
  } catch (err) {
    console.error('CSV to JSON error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/text/json-to-csv
router.post('/json-to-csv', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!checkTextFileSize(req.file.path, res)) return;

  try {
    const jsonContent = fs.readFileSync(req.file.path, 'utf-8');
    let data = JSON.parse(jsonContent);

    // Handle nested JSON - try to extract array
    if (!Array.isArray(data)) {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          data = data[key];
          break;
        }
      }
      if (!Array.isArray(data)) {
        data = [data];
      }
    }

    // Flatten one level of nesting
    const flatData = data.map(item => {
      const flat = {};
      for (const [key, val] of Object.entries(item)) {
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          for (const [subKey, subVal] of Object.entries(val)) {
            flat[`${key}_${subKey}`] = subVal;
          }
        } else {
          flat[key] = Array.isArray(val) ? JSON.stringify(val) : val;
        }
      }
      return flat;
    });

    const csvString = objectsToCSV(flatData);
    const outputFilename = `${uuidv4()}.csv`;
    const outputPath = path.join(outputsPath, outputFilename);
    fs.writeFileSync(outputPath, csvString, 'utf-8');

    fs.unlinkSync(req.file.path);
    const stats = fs.statSync(outputPath);

    recordConversion('json_to_csv');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      rows: flatData.length,
    });
  } catch (err) {
    console.error('JSON to CSV error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/text/csv-to-xlsx
router.post('/csv-to-xlsx', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!checkTextFileSize(req.file.path, res)) return;

  try {
    const csvContent = fs.readFileSync(req.file.path, 'utf-8');
    const data = parseCSV(csvContent);
    if (data.length > XLSX_MAX_ROWS) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `행 수가 너무 많습니다. 최대 ${XLSX_MAX_ROWS.toLocaleString()}행까지 지원합니다.` });
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-width columns
    const colWidths = [];
    const headers = Object.keys(data[0] || {});
    headers.forEach((h, i) => {
      let maxLen = h.length;
      data.forEach(row => {
        const val = String(row[h] || '');
        if (val.length > maxLen) maxLen = val.length;
      });
      colWidths.push({ wch: Math.min(maxLen + 2, 50) });
    });
    worksheet['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const outputFilename = `${uuidv4()}.xlsx`;
    const outputPath = path.join(outputsPath, outputFilename);
    XLSX.writeFile(workbook, outputPath);

    fs.unlinkSync(req.file.path);
    const stats = fs.statSync(outputPath);

    recordConversion('csv_to_xlsx');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      rows: data.length,
      columns: headers.length,
    });
  } catch (err) {
    console.error('CSV to XLSX error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/text/xlsx-to-csv
router.post('/xlsx-to-csv', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { sheet } = req.body;

  try {
    // XLSX Bomb 방어: 셀 수 제한 적용하여 파싱
    const workbook = XLSX.readFile(req.file.path, { dense: true, sheetRows: XLSX_MAX_ROWS + 1 });
    const sheetName = sheet || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      return res.status(400).json({ error: `Sheet "${sheetName}" not found` });
    }

    // 행 수 초과 검사
    const rowCount = XLSX.utils.sheet_to_json(worksheet).length;
    if (rowCount > XLSX_MAX_ROWS) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `행 수가 너무 많습니다. 최대 ${XLSX_MAX_ROWS.toLocaleString()}행까지 지원합니다.` });
    }

    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const outputFilename = `${uuidv4()}.csv`;
    const outputPath = path.join(outputsPath, outputFilename);
    fs.writeFileSync(outputPath, csvContent, 'utf-8');

    fs.unlinkSync(req.file.path);
    const stats = fs.statSync(outputPath);

    recordConversion('xlsx_to_csv');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
      sheets: workbook.SheetNames,
    });
  } catch (err) {
    console.error('XLSX to CSV error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

// POST /api/text/json-to-xml
router.post('/json-to-xml', upload.single('file'), checkFileSecurity, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (!checkTextFileSize(req.file.path, res)) return;

  const { rootElement = 'root', itemElement = 'item' } = req.body;

  try {
    const jsonContent = fs.readFileSync(req.file.path, 'utf-8');
    let data = JSON.parse(jsonContent);

    // Wrap arrays with item elements
    let xmlData;
    if (Array.isArray(data)) {
      xmlData = { [rootElement]: { [itemElement]: data } };
    } else {
      xmlData = { [rootElement]: data };
    }

    const builder = new XMLBuilder({
      ignoreAttributes: false,
      format: true,
      indentBy: '  ',
      suppressBooleanAttributes: false,
    });

    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(xmlData)}`;

    const outputFilename = `${uuidv4()}.xml`;
    const outputPath = path.join(outputsPath, outputFilename);
    fs.writeFileSync(outputPath, xmlContent, 'utf-8');

    fs.unlinkSync(req.file.path);
    const stats = fs.statSync(outputPath);

    recordConversion('json_to_xml');
    res.json({
      success: true,
      filename: outputFilename,
      downloadUrl: `/outputs/${outputFilename}`,
      size: stats.size,
    });
  } catch (err) {
    console.error('JSON to XML error:', err);
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: `Conversion failed: ${err.message}` });
  }
});

export default router;
