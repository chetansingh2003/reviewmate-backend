const axios = require("axios");

async function fetchReviews(token) {

  const response = await axios.get(
    `https://mybusiness.googleapis.com/v4/accounts/${process.env.GOOGLE_ACCOUNT_ID}/locations/${process.env.GOOGLE_LOCATION_ID}/reviews`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.reviews || [];
}

async function replyReview(
  token,
  reviewName,
  replyText
) {

  await axios.put(
    `https://mybusiness.googleapis.com/v4/${reviewName}/reply`,
    {
      comment: replyText,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

module.exports = {
  fetchReviews,
  replyReview,
};