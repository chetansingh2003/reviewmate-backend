import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.post("/generate-review", async (req, res) => {
  try {

    const { category, mood, rating } = req.body;

    const msg =
      await anthropic.messages.create({
        model: "claude-3-5-sonnet-latest",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: `
Business: ${category}
Rating: ${rating}
Tone: ${mood}

Write a short, natural, SEO-friendly customer review in 2-4 sentences.
`
          }
        ]
      });

    res.json({
      review: msg.content[0].text
    });

  } catch (e) {

    console.error(e);

    res.status(500).json({
      error: e.message
    });
  }
});