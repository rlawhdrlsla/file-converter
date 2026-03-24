# FileConvert — Free Online File Converter

A production-ready file converter website built with React + Vite (frontend) and Node.js + Express (backend).

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Start the Servers

**Terminal 1 — Backend (port 3001):**
```bash
cd server && npm run dev
```

**Terminal 2 — Frontend (port 5173):**
```bash
cd client && npm run dev
```

Then open http://localhost:5173

---

## Features

### Image Tools
- Image Converter (JPG, PNG, WebP, BMP, TIFF, GIF, AVIF)
- Image Resizer (pixels or percentage)
- Image Compressor (quality slider)
- Image Cropper (coordinate-based)
- Image to PDF

### PDF Tools
- PDF Merger
- PDF Splitter (by page range)
- PDF Compressor
- (PDF to Word / Word to PDF require additional libraries — see below)

### Audio & Video Tools
- Audio Converter (MP3, WAV, AAC, FLAC, OGG, M4A)
- Video Converter (MP4, AVI, MOV, MKV, WebM)
- Video to GIF
- Video Compressor

> **Note:** Audio and Video tools require FFmpeg to be installed.
> - macOS: `brew install ffmpeg`
> - Ubuntu/Debian: `sudo apt install ffmpeg`

### Data Tools
- CSV to JSON
- JSON to CSV
- CSV to XLSX (Excel)
- JSON to XML
- XLSX to CSV

### Archive Tools
- ZIP Creator
- ZIP Extractor

---

## Tech Stack

**Frontend:**
- React 18 + Vite 5
- Tailwind CSS 3 (dark mode support)
- Framer Motion (animations)
- React Router v6
- React Dropzone
- Lucide React icons
- Axios + React Hot Toast

**Backend:**
- Node.js + Express 4
- Multer (file uploads, 100MB limit)
- Sharp (image processing)
- pdf-lib (PDF manipulation)
- XLSX.js (spreadsheet conversion)
- Archiver + Unzipper (ZIP archives)
- fast-xml-parser (JSON to XML)
- FFmpeg (via child_process for audio/video)

---

## Directory Structure

```
file-converter/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages (image/, pdf/, text/, etc.)
│   │   ├── context/      # ThemeContext (dark/light mode)
│   │   ├── App.jsx       # Routes
│   │   └── index.css     # Tailwind + custom styles
│   ├── vite.config.js    # Proxies /api and /outputs to backend
│   └── tailwind.config.js
└── server/               # Node.js backend
    ├── routes/           # image.js, pdf.js, text.js, audio.js, video.js, archive.js
    ├── middleware/        # upload.js (Multer config)
    ├── utils/            # cleanup.js (deletes files > 1hr)
    ├── uploads/          # Temp upload directory
    ├── outputs/          # Converted file output directory
    └── index.js          # Express server
```

---

## Configuration

The Vite dev server proxies `/api/*` and `/outputs/*` to `http://localhost:3001`.

For production deployment, serve the `client/dist` build as static files from the Express server, or deploy them separately with a reverse proxy (nginx, etc.).

---

## Optional: PDF to Word / Word to PDF

These require additional tools:
- **Word to PDF**: Install LibreOffice (`brew install libreoffice`) then call `libreoffice --headless --convert-to pdf`
- **PDF to Word**: Use `pdf2docx` (Python) or a cloud API like Adobe PDF Services

---

## File Cleanup

Files in `uploads/` and `outputs/` are automatically deleted after 1 hour. The cleanup job runs every 30 minutes via `setInterval` in `server/utils/cleanup.js`.
