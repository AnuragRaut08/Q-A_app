// pages/index.js
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const APP_TOKEN = process.env.NEXT_PUBLIC_APP_TOKEN || "replace-me"; // set in .env.local

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return alert("Choose a PDF file first");
    const form = new FormData();
    form.append("file", file);

    setUploadStatus("Uploading...");
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "x-app-token": APP_TOKEN,
      },
      body: form,
    });
    const data = await res.json();
    if (res.ok) {
      setUploadStatus(`Uploaded — stored ${data.chunksStored} chunks`);
    } else {
      setUploadStatus("Upload failed: " + (data.error || res.statusText));
    }
  }

  async function handleAsk(e) {
    e.preventDefault();
    setAnswer("Thinking...");
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-token": APP_TOKEN,
      },
      body: JSON.stringify({ question }),
    });
    const data = await res.json();
    if (res.ok) {
      setAnswer(data.answer);
    } else {
      setAnswer("Error: " + (data.error || res.statusText));
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "24px auto", fontFamily: "sans-serif" }}>
      <h1>Mini PDF Q&A (Demo)</h1>

      <section style={{ marginBottom: 24 }}>
        <h3>Upload PDF</h3>
        <form onSubmit={handleUpload}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          <br />
          <button type="submit" style={{ marginTop: 8 }}>Upload</button>
        </form>
        <div>{uploadStatus}</div>
      </section>

      <section>
        <h3>Ask a question</h3>
        <form onSubmit={handleAsk}>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question about the uploaded PDF"
            style={{ width: "100%", padding: 8 }}
          />
          <button type="submit" style={{ marginTop: 8 }}>Ask</button>
        </form>

        <div style={{ marginTop: 12 }}>
          <h4>Answer</h4>
          <div style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 12 }}>
            {answer}
          </div>
        </div>
      </section>
    </div>
  );
}
