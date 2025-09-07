
# 📘 Mini PDF Q\&A (RAG-based System)

An end-to-end **Retrieval Augmented Generation (RAG)** system built with **Next.js** that allows users to:

* 📂 Upload a **PDF document**
* ✂️ Automatically **extract & chunk text**
* 🔍 Generate **vector embeddings** using OpenAI
* 📡 Store embeddings in a local **vector store** (JSON file, replaceable with Pinecone/Chroma/pgvector)
* ❓ Ask **natural language questions** about the PDF
* 🤖 Receive accurate answers via **context-aware LLM reasoning**


## 🚀 Features

* **Next.js Full-Stack** → React frontend + protected API routes
* **Secure API Access** → Token-based authentication for all endpoints
* **PDF Ingestion** → Extracts text from PDFs using [`pdf-parse`](https://www.npmjs.com/package/pdf-parse)
* **Text Chunking** → Splits large documents into overlapping segments for efficient retrieval
* **Embeddings** → Uses [OpenAI Embeddings API](https://platform.openai.com/docs/guides/embeddings) (`text-embedding-3-small`)
* **Vector Storage** → Local JSON file with cosine similarity search (production-ready swap to Pinecone/Chroma/pgvector)
* **Retrieval-Augmented Generation** → Context chunks retrieved and passed into Chat Completion model (`gpt-4o` by default)
* **Frontend UI** → Upload PDFs and ask questions directly from the browser
* **Extensible** → Easy to extend with OCR (for scanned PDFs), streaming answers, or enterprise vector DBs

---

## 📂 Project Structure

```
Q-A_app/
├─ package.json
├─ .env.example
├─ pages/
│  ├─ index.js          # Frontend UI (upload + ask)
│  └─ api/
│     ├─ upload.js      # PDF ingestion & embeddings
│     └─ ask.js         # Question answering (RAG)
├─ lib/
│  ├─ vectorStore.js    # Local JSON vector DB + cosine search
│  └─ openaiClient.js   # OpenAI client wrapper
├─ utils/
│  └─ chunkText.js      # Text chunking utility
└─ data/
   └─ vectors.json      # Generated embeddings (auto-created)
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/q-a_app.git
cd q-a_app
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-xxxxxx          # Your OpenAI API key
APP_API_TOKEN=super-secret        # Server-side token
NEXT_PUBLIC_APP_TOKEN=super-secret  # Frontend token (must match APP_API_TOKEN)
```

### 3. Run in Dev Mode

```bash
npm run dev
```

Now open 👉 [http://localhost:3000](http://localhost:3000)

### 4. Build & Run in Production

```bash
npm run build
npm run start
```

---

## 🧪 Demo (Sample Walkthrough)

1. Upload a **PDF** (e.g., `sample.pdf` with internship guidelines).

   * Backend extracts text, chunks it, embeds each chunk, and stores them.
   * Response: `Uploaded — stored 4 chunks`.

2. Ask questions:

   * *“What are the working hours for interns?”*
     → *“9 AM to 6 PM, Monday to Friday.”*
   * *“When is the final presentation?”*
     → *“The last week of the internship.”*
   * *“Who is the CEO of Example Corp?”* (not in PDF)
     → *“I don’t know based on the provided document.”* ✅ (No hallucinations)

---

## 🛠️ Technical Deep Dive

### 🔐 Secure API Routes

* Both `/api/upload` and `/api/ask` require a token (`x-app-token`) matching `APP_API_TOKEN`.
* Demonstrates knowledge of protecting server endpoints.

### 📂 Chunking Strategy

* Documents are split into overlapping chunks (`1000 chars` with `200 overlap`).
* Overlap ensures semantic continuity across chunks.

### 🔍 Vector Search

* **Cosine similarity** implemented manually in `vectorStore.js`.
* Returns top-K most relevant chunks.
* Designed for easy swap with **Pinecone/Chroma/pgvector**.

### 🧠 RAG Pipeline

```
Upload → Extract text → Chunk → Embed → Store
Question → Embed → Retrieve top chunks → Inject into prompt → LLM Answer
```

### ⚡ Scalability Notes

* Swap JSON file store with **Pinecone** for millions of embeddings.
* Add **OCR** fallback (e.g., Tesseract.js) for scanned PDFs.
* Add **streaming answers** via OpenAI for real-time UI typing effect.
* Extend to support **multi-document retrieval** and metadata storage.

---

## 📊 Architecture Diagram

```
+-------------+         +----------------+         +------------------+
|  Frontend   | <-----> |  Next.js API   | <-----> |   OpenAI Models  |
|  (React UI) |         |   Routes       |         | (Embeddings/Chat)|
+-------------+         +----------------+         +------------------+
       |                        |
       v                        v
   Upload PDF              Local Vector DB
                           (JSON / Pinecone)
```

---

## 🔮 Future Improvements

* 🖼 OCR for scanned documents
* 📝 Highlight answers in PDF text
* 🌍 Multi-language PDF support
* 🧪 Unit tests for chunking & retrieval
* 🔄 Streaming answers (for UX polish)

---

## 📑 License

MIT License. Free to use and adapt.


