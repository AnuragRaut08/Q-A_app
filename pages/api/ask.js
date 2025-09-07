// pages/api/ask.js
import { getOpenAI } from "../../lib/openaiClient";
import { search } from "../../lib/vectorStore";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const token = req.headers["x-app-token"];
  if (!token || token !== process.env.APP_API_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: "question required" });

    const openai = getOpenAI();
    // get embedding for question
    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const qEmb = embRes.data[0].embedding;

    // retrieve top 3 relevant chunks
    const results = search(qEmb, 3);

    // build context string
    const contextText = results
      .map((r, i) => `Chunk ${i + 1} (score=${r.score.toFixed(4)}):\n${r.text}`)
      .join("\n\n----\n\n");

    // Build prompt for chat completion
    const systemPrompt = `You are an assistant that answers questions using only the provided context. If the answer is not in the context, say "I don't know based on the provided document." Keep answers concise and reference chunk numbers if useful.`;

    const userPrompt = `Context:\n${contextText}\n\nQuestion: ${question}\n\nAnswer:`;

    // call chat completions
    const chatRes = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-4" or any chat model available to you
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0.0,
    });

    const answer = chatRes.choices?.[0]?.message?.content || "No answer returned";

    return res.status(200).json({
      ok: true,
      answer,
      retrieved: results.map(r => ({ id: r.id, score: r.score })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message || "server error" });
  }
}
