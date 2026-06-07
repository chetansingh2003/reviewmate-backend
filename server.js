const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const reviewChecker =
  require("./cron/reviewChecker");
const { google } = require("googleapis");
const axios = require("axios");
require("dotenv").config();

console.log(
  "OPENAI:",
  process.env.OPENAI_API_KEY
);

console.log(
  "REDIRECT URI:",
  process.env.GOOGLE_REDIRECT_URI
);


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log(
  "OPENAI KEY:",
  process.env.OPENAI_API_KEY
    ? "FOUND"
    : "NOT FOUND"
);






app.get("/test", (req, res) => {
  res.json({
    success: true,
  });
});

app.post("/generate-review", async (req, res) => {
  try {
    const { category, mood, rating } = req.body;

    console.log("REQUEST:", req.body);

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 150,
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
      });

    res.json({
      review:
        completion.choices[0].message.content,
    });

  }catch (err) {

  console.log(
    "FULL ERROR:",
    JSON.stringify(
      err.response?.data,
      null,
      2
    )
  );

  res.status(
    err.response?.status || 500
  ).json(
    err.response?.data || {
      error: err.message
    }
  );
}
});
reviewChecker.start();

const PORT =
  process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on ${PORT}`
  );
});
console.log("CLIENT ID:",
  process.env.GOOGLE_CLIENT_ID);

console.log("CLIENT SECRET:",
  process.env.GOOGLE_CLIENT_SECRET
    ? "FOUND"
    : "NOT FOUND");

console.log("REDIRECT:",
  process.env.GOOGLE_REDIRECT_URI);


const oauth2Client =
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

app.get("/auth/google", (req, res) => {

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/business.manage"
    ]
  });

  res.redirect(url);
});

app.get(
  "/auth/google/callback",
  async (req, res) => {

    try {

      const code = req.query.code;

      const { tokens } =
        await oauth2Client.getToken(code);

      console.log(
        "ACCESS TOKEN:",
        tokens.access_token
      );

      console.log(
        "REFRESH TOKEN:",
        tokens.refresh_token
      );

      res.send(
        "Google Business Connected Successfully"
      );

    } catch (error) {

      console.error(error);

      res.status(500).send(
        "OAuth Error"
      );
    }
  }
);


app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.get("/health", (req, res) => {
  res.send("OK");
});


app.get("/accounts", async (req, res) => {

  try {

    oauth2Client.setCredentials({
      refresh_token:
        process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken =
      await oauth2Client.getAccessToken();

    const response =
      await axios.get(
        "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
        {
          headers: {
            Authorization:
              `Bearer ${accessToken.token}`,
          },
        }
      );

    res.json(response.data);

  } catch (err) {

    console.log(
      "GOOGLE ERROR:",
      JSON.stringify(
        err.response?.data,
        null,
        2
      )
    );

    res.status(
      err.response?.status || 500
    ).json(
      err.response?.data || {
        error: err.message
      }
    );
  }

});
app.get("/locations", async (req, res) => {

  try {

    oauth2Client.setCredentials({
      refresh_token:
        process.env.GOOGLE_REFRESH_TOKEN,
    });

    const accessToken =
      await oauth2Client.getAccessToken();

    const response =
      await axios.get(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${process.env.GOOGLE_ACCOUNT_ID}/locations`,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken.token}`,
          },
        }
      );

    res.json(response.data);

  } catch (err) {

    console.log(
      "LOCATION ERROR:",
      JSON.stringify(
        err.response?.data,
        null,
        2
      )
    );

    res.status(
      err.response?.status || 500
    ).json(
      err.response?.data || {
        error: err.message
      }
    );
  }

});