# Gemini API Integration

Project ini adalah backend sederhana berbasis **Node.js + Express** untuk integrasi ke **Google Gemini API** menggunakan SDK `@google/genai`.

Aplikasi ini dibuat untuk latihan kelas AI Productivity & AI API Integration (Hacktiv8), dengan fokus pada penggunaan Gemini untuk beberapa tipe input:
- Prompt teks biasa
- Gambar (`multipart/form-data`)
- Dokumen (`multipart/form-data`)
- Audio (`multipart/form-data`)

## Fitur Utama

- Endpoint `POST /generate-content` untuk generate respon dari prompt teks.
- Endpoint `POST /generate-image` untuk analisis/generasi respon berbasis gambar + prompt.
- Endpoint `POST /generate-document` untuk analisis dokumen + prompt.
- Endpoint `POST /generate-audio` untuk analisis audio + prompt.
- Parsing form-data menggunakan `multer`.

## Tech Stack

- Node.js
- Express
- `@google/genai`
- Multer
- Dotenv
- Nodemon

## Struktur Project

```bash
Gemini API Integration/
├── index.js
├── package.json
├── package-lock.json
├── .env
└── .gitignore
```

## Cara Menjalankan

1. Install dependency:

```bash
npm install
```

2. Isi file `.env` dengan API key Gemini:

```env
GEMINI_API_KEY=your_api_key_here
```

3. Jalankan server development:

```bash
npm run dev
```

4. Server akan aktif di:

```bash
http://localhost:3000
```

## Konfigurasi API

Di `index.js`, SDK diinisialisasi dengan:

```js
const ai = new GoogleGenAI({});
```

Library `@google/genai` akan membaca API key dari environment variable (misalnya `GEMINI_API_KEY`).

Model default yang dipakai saat ini:

```js
const GEMINI_MODEL = 'gemini-3.5-flash';
```

Jika model tersebut tidak tersedia di akun/region kamu, ganti ke model Gemini yang tersedia di project Google AI Studio kamu.

## Dokumentasi Endpoint

Base URL:

```bash
http://localhost:3000
```

### 1) Generate dari Prompt Teks

- **Method**: `POST`
- **Path**: `/generate-content`
- **Content-Type**: `multipart/form-data` atau `application/x-www-form-urlencoded`
- **Body**:
  - `prompt` (string, wajib)

Contoh cURL:

```bash
curl -X POST http://localhost:3000/generate-content \
  -F "prompt=Jelaskan konsep AI secara singkat"
```

Contoh response sukses:

```json
{
  "result": "AI adalah teknologi yang memungkinkan mesin meniru kemampuan kognitif manusia..."
}
```

### 2) Generate dari Gambar + Prompt

- **Method**: `POST`
- **Path**: `/generate-image`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `prompt` (string, wajib)
  - `image` (file, wajib)

Contoh cURL:

```bash
curl -X POST http://localhost:3000/generate-image \
  -F "prompt=Deskripsikan isi gambar ini" \
  -F "image=@/path/ke/gambar.jpg"
```

### 3) Generate dari Dokumen + Prompt

- **Method**: `POST`
- **Path**: `/generate-document`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `prompt` (string, wajib)
  - `document` (file, wajib)

Contoh cURL:

```bash
curl -X POST http://localhost:3000/generate-document \
  -F "prompt=Ringkas dokumen ini dalam 5 poin" \
  -F "document=@/path/ke/dokumen.pdf"
```

### 4) Generate dari Audio + Prompt

- **Method**: `POST`
- **Path**: `/generate-audio`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `prompt` (string, wajib)
  - `audio` (file, wajib)

Contoh cURL:

```bash
curl -X POST http://localhost:3000/generate-audio \
  -F "prompt=Transkrip dan rangkum audio ini" \
  -F "audio=@/path/ke/audio.mp3"
```

## Format Error Response

Semua endpoint akan mengembalikan format error:

```json
{
  "error": "pesan error"
}
```

dengan status code `500` jika terjadi kegagalan proses ke Gemini API.

## Catatan Implementasi

- File upload saat ini diproses in-memory oleh `multer()` (belum disimpan ke disk).
- Input file dikonversi ke Base64 lalu dikirim sebagai `inlineData` ke Gemini.
- Validasi `prompt` dan file belum ketat; bisa ditambah agar API lebih robust.
- Endpoint belum memiliki authentication/authorization (masih untuk kebutuhan belajar).

## Pengembangan Lanjutan (Opsional)

- Tambah validasi request (`prompt` kosong, tipe file, ukuran file).
- Tambah middleware error handling terpusat.
- Tambah logging yang lebih rapi.
- Tambah endpoint health check (`GET /health`).
- Tambah rate limiting untuk proteksi abuse.

## Lisensi

ISC
