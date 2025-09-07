// pages/api/upload.js
import formidable from "formidable";
import fs from "fs";
import pdfParse from "pdf-parse";
import { getOpenAI } from "../../lib/openaiClient";
import { chunkText } from "../../utils/chunkText";
import { addVectors } from "../../lib/vectorStore";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

function unauthorized(res) {
  res.status(401).json({ error: "unauthorized" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = req.headers["x-app-token"];
  if (!token || token !== process.env.APP_API_TOKEN) return unauthorized(res);

  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw err;
      const file = files?.file;
      if (!file) return res.status(400).json({ error: "file is required" });

      // read PDF buffer
      const data = fs.readFileSync(file.filepath);
      const pdfData = await pdfParse(data);
      const text = pdfData.text || "";

      // chunk text
      const chunks = chunkText(text, 1000, 200);

      // generate embeddings in batches
      const openai = getOpenAI();
      const vectorItems = [];
      for (const chunk of chunks) {
        // OpenAI embeddings API
        const embRes = await openai.embeddings.create({
          model: "text-embedding-3-small", // or "text-embedding-3-large"
          input: chunk,
        });
        const embedding = embRes.data[0].embedding;
        vectorItems.push({
          id: uuidv4(),
          text: chunk,
          embedding,
        });
      }

      // store vectors
      addVectors(vectorItems);

      return res.status(200).json({
        ok: true,
        chunksStored: vectorItems.length,
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: e.message || "server error" });
    }
  });
}
