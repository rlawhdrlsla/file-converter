import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import ImageConverter from './pages/image/ImageConverter.jsx';
import ImageResizer from './pages/image/ImageResizer.jsx';
import ImageCompressor from './pages/image/ImageCompressor.jsx';
import ImageCropper from './pages/image/ImageCropper.jsx';
import PdfMerger from './pages/pdf/PdfMerger.jsx';
import PdfSplitter from './pages/pdf/PdfSplitter.jsx';
import ImageToPdf from './pages/pdf/ImageToPdf.jsx';
import PdfCompressor from './pages/pdf/PdfCompressor.jsx';
import CsvToJson from './pages/text/CsvToJson.jsx';
import JsonToCsv from './pages/text/JsonToCsv.jsx';
import CsvToXlsx from './pages/text/CsvToXlsx.jsx';
import JsonToXml from './pages/text/JsonToXml.jsx';
import XlsxToCsv from './pages/text/XlsxToCsv.jsx';
import ZipCreator from './pages/archive/ZipCreator.jsx';
import ZipExtractor from './pages/archive/ZipExtractor.jsx';
import About from './pages/About.jsx';
import Privacy from './pages/Privacy.jsx';
import Terms from './pages/Terms.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';

function App() {
  useEffect(() => {
    fetch('/api/visit', { method: 'POST' }).catch(() => {});
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
      <Routes>
        {/* 관리자 페이지 — Navbar/Footer 없이 독립 렌더링 */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* Image Routes */}
          <Route path="image/convert" element={<ImageConverter />} />
          <Route path="image/resize" element={<ImageResizer />} />
          <Route path="image/compress" element={<ImageCompressor />} />
          <Route path="image/crop" element={<ImageCropper />} />
          <Route path="image/to-pdf" element={<ImageToPdf />} />
          {/* PDF Routes */}
          <Route path="pdf/merge" element={<PdfMerger />} />
          <Route path="pdf/split" element={<PdfSplitter />} />
          <Route path="pdf/compress" element={<PdfCompressor />} />
          {/* Text/Data Routes */}
          <Route path="text/csv-to-json" element={<CsvToJson />} />
          <Route path="text/json-to-csv" element={<JsonToCsv />} />
          <Route path="text/csv-to-xlsx" element={<CsvToXlsx />} />
          <Route path="text/json-to-xml" element={<JsonToXml />} />
          <Route path="text/xlsx-to-csv" element={<XlsxToCsv />} />
          {/* Archive Routes */}
          <Route path="archive/zip-creator" element={<ZipCreator />} />
          <Route path="archive/zip-extractor" element={<ZipExtractor />} />
          {/* Info Routes */}
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
