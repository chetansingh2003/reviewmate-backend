const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("ReviewMate Backend Running Successfully");
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
  });
});

app.post("/generate-review", async (req, res) => {
  try {
    const { category, mood, rating } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: `
Business: ${category}
Rating: ${rating}
Tone: ${mood}

Write a short, natural, SEO-friendly customer review in 2-4 sentences.
`,
        },
      ],
      max_tokens: 150,
    });

    res.json({
      review: completion.choices[0].message.content,
    });
  } catch (e) {
    console.error("OPENAI ERROR:", e);

    res.status(500).json({
      error: e.message,
    });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on ${PORT}`);
});