const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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