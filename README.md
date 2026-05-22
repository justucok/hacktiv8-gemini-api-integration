# Gemini API Integration

Backend sederhana berbasis **Node.js + Express** dengan integrasi **Google Gemini API** (`@google/genai`) untuk mendukung aplikasi chatbot. Server menerima percakapan dalam format JSON, memanggil model Gemini, lalu mengembalikan balasan teks.

Project ini dibuat untuk latihan kelas AI Productivity & AI API Integration (Hacktiv8).

## Frontend (repo terpisah)

UI chatbot berada di folder **`Gemini Chatbot/`** (di luar folder backend ini). Rencananya frontend akan disimpan di **repository terpisah**.

Saat development lokal, `index.js` masih bisa menyajikan file statis dari `../Gemini Chatbot/public` agar chatbot bisa diuji tanpa repo frontend terpisah. Setelah frontend dipindah ke repo lain, arahkan URL API frontend ke base URL backend ini (misalnya `http://localhost:3000`) dan tambahkan konfigurasi **CORS** di backend jika origin frontend berbeda.

## Fitur Utama

- **Chat multi-turn** lewat endpoint `POST /api/conversation` menggunakan `ai.chats.create()` agar konteks percakapan tetap terjaga.
- **Chat satu request** lewat endpoint `POST /api/singe-chat` dengan mengirim seluruh array percakapan sekaligus ke `generateContent`.
- **Instruksi sistem** tetap meminta Gemini menjawab dalam bahasa Indonesia.
- **Validasi input** dasar pada body JSON (tipe data, array kosong, format history).
- **Penanganan rate limit** pada `/api/conversation` (status `429` jika kuota Gemini habis).
- **Serving file statis** (opsional, untuk development) dari folder `Gemini Chatbot/public`.

Versi lama backend yang mendukung upload gambar, dokumen, dan audio ada di **`index_old.js`** (endpoint `/generate-content`, `/generate-image`, dll.). File tersebut tidak lagi dipakai oleh `index.js` saat ini.

## Tech Stack

- Node.js (ES modules)
- Express
- `@google/genai`
- Dotenv
- Nodemon (development)

## Struktur Project

```bash
Gemini API Integration/
├── index.js          # Entry point backend chatbot
├── index_old.js      # Versi lama (multipart: teks, gambar, dokumen, audio)
├── package.json
├── package-lock.json
├── .env              # Konfigurasi (jangan di-commit)
├── .env_example      # Contoh variabel environment
└── .gitignore
```

### Alur program di `index.js`

1. **Inisialisasi** — Load environment (`dotenv`), buat instance `GoogleGenAI`, baca `GEMINI_MODEL` dan `API_PORT`.
2. **Middleware** — `express.json()` untuk body JSON; `express.static` ke `Gemini Chatbot/public` (development).
3. **Routing** — Handler `POST /api/conversation` dan `POST /api/singe-chat` memanggil Gemini lalu mengembalikan JSON.
4. **Listen** — Server berjalan di port dari `API_PORT` (default `3000`).

## Cara Menjalankan

1. Install dependency:

```bash
npm install
```

2. Salin dan isi environment (lihat `.env_example`):

```env
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-3.5-flash
API_PORT=3000
```

3. Jalankan server development:

```bash
npm run dev
```

4. Server aktif di:

```text
http://localhost:3000
```

Jika folder `Gemini Chatbot/public` ada di path relatif yang benar, buka URL di atas di browser untuk menguji UI. Frontend memanggil `POST /api/conversation`.

## Konfigurasi API

SDK diinisialisasi tanpa parameter eksplisit; API key dibaca dari environment:

```js
const ai = new GoogleGenAI({});
```

Model dan port bisa diatur lewat `.env`:

```js
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
const PORT = process.env.API_PORT || 3000;
```

Jika model tidak tersedia di akun/region Anda, ganti `GEMINI_MODEL` ke model yang aktif di [Google AI Studio](https://aistudio.google.com/).

## Dokumentasi Endpoint

Base URL:

```text
http://localhost:3000
```

Semua endpoint chat menggunakan **`Content-Type: application/json`**.

### 1) Percakapan dengan history (disarankan)

Endpoint utama yang dipakai frontend di `Gemini Chatbot/public/script.js`.

| Item | Nilai |
|------|--------|
| **Method** | `POST` |
| **Path** | `/api/conversation` |
| **Content-Type** | `application/json` |

**Body (format A — pesan tunggal + history opsional):**

```json
{
  "message": "Halo, siapa kamu?",
  "history": [
    { "role": "user", "text": "Pesan sebelumnya" },
    { "role": "model", "text": "Balasan sebelumnya" }
  ]
}
```

- `message` (string, wajib) — pesan user terbaru.
- `history` (array, opsional) — giliran sebelumnya. Setiap item bisa memakai `text` atau `parts` (format Gemini).

**Body (format B — array percakapan, kompatibel dengan frontend):**

```json
{
  "conversation": [
    { "role": "user", "text": "Halo" },
    { "role": "model", "text": "Halo! Ada yang bisa dibantu?" },
    { "role": "user", "text": "Jelaskan Node.js singkat" }
  ]
}
```

- `conversation` (array, wajib jika dipakai) — tidak boleh kosong. Pesan terakhir dianggap sebagai input user; sisanya menjadi history.

**Response sukses (`200`):**

```json
{
  "result": "Teks balasan dari Gemini",
  "history": [ "...format lengkap dari SDK..." ],
  "simpleHistory": [
    { "role": "user", "text": "..." },
    { "role": "model", "text": "..." }
  ]
}
```

**Contoh cURL (format conversation):**

```bash
curl -X POST http://localhost:3000/api/conversation \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [
      { "role": "user", "text": "Apa itu REST API?" }
    ]
  }'
```

**Error umum:**

| Status | Kondisi |
|--------|---------|
| `400` | `message` kosong/invalid, `history` bukan array, format item history salah, `conversation` kosong |
| `429` | Kuota / rate limit Gemini |
| `500` | Error lain dari Gemini atau server |

---

### 2) Chat satu request (seluruh percakapan sekaligus)

| Item | Nilai |
|------|--------|
| **Method** | `POST` |
| **Path** | `/api/singe-chat` |
| **Content-Type** | `application/json` |

**Body:**

```json
{
  "conversation": [
    { "role": "user", "text": "Halo" },
    { "role": "model", "text": "Halo! Ada yang bisa dibantu?" },
    { "role": "user", "text": "Buatkan 3 ide nama produk kopi" }
  ]
}
```

- `conversation` (array, wajib) — setiap item harus punya `role` (`"user"` atau `"model"`) dan `text` (string).

**Response sukses (`200`):**

```json
{
  "result": "Teks balasan dari Gemini"
}
```

**Response validasi gagal (`400`):**

```json
{
  "message": "Invalid Request"
}
```

**Contoh cURL:**

```bash
curl -X POST http://localhost:3000/api/singe-chat \
  -H "Content-Type: application/json" \
  -d '{
    "conversation": [
      { "role": "user", "text": "Sebutkan 2 manfaat belajar AI" }
    ]
  }'
```

**Response error server (`500`):**

```json
{
  "error": "pesan error"
}
```

---

### File statis (development)

| Item | Nilai |
|------|--------|
| **Method** | `GET` |
| **Path** | `/`, `/index.html`, `/script.js`, dll. |
| **Sumber** | `../Gemini Chatbot/public` |

Hanya relevan saat struktur monorepo lokal masih ada. Setelah frontend di repo terpisah, gunakan hosting frontend sendiri dan panggil API backend lewat URL penuh.

## Konfigurasi Gemini per request

Pada kedua endpoint chat, konfigurasi model antara lain:

- **Model**: `GEMINI_MODEL` dari environment
- **Temperature**: `0.9`
- **System instruction**: `"Jawab hanya menggunakan bahasa Indonesia."`

## Format Error Response

- `/api/conversation` — `{ "error": "pesan error" }` (dan `429` untuk rate limit)
- `/api/singe-chat` — `{ "message": "Invalid Request" }` untuk validasi; `{ "error": "..." }` untuk error server

## Catatan Implementasi

- Backend saat ini fokus pada **teks**; tidak ada upload file di `index.js`.
- Belum ada **authentication**, **CORS** eksplisit, atau **rate limiting** di sisi Express (hanya deteksi error kuota dari Gemini).
- Path `/api/singe-chat` mengikuti penamaan di kode (typo *singe*); konsistenkan penamaan di kode dan dokumentasi jika nanti di-refactor.
- Untuk produksi: pisahkan frontend ke repo sendiri, aktifkan CORS, batasi origin, dan jangan expose `GEMINI_API_KEY` ke client.

## Pengembangan Lanjutan (Opsional)

- Tambah middleware CORS untuk frontend di repo terpisah.
- Tambah `GET /health` untuk health check.
- Validasi panjang percakapan dan jumlah token.
- Perbaiki dan uji endpoint `/api/singe-chat` (validasi urutan `contents` di handler).
- Environment variable `FRONTEND_URL` untuk konfigurasi CORS.

## Lisensi

ISC
