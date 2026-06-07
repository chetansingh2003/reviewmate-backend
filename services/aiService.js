require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateReply(reviewText, rating) {

  const prompt = `
You are a professional business owner.

Rating: ${rating}
Review: ${reviewText}

Generate a short polite reply.
`;

  const response =
    await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

  return response.choices[0].message.content;
}

module.exports = {
  generateReply,
};