const cron = require("node-cron");

const {
  getAccessToken,
} = require("../services/googleService");

const {
  fetchReviews,
  replyReview,
} = require("../services/reviewService");

const {
  generateReply,
} = require("../services/aiService");

function start() {

  console.log("Review Checker Started");

  cron.schedule("*/5 * * * *", async () => {

    console.log("Checking reviews...");

    try {

      const token =
        await getAccessToken();

      const reviews =
        await fetchReviews(token);

      for (const review of reviews) {

        if (review.reviewReply)
          continue;

        const aiReply =
          await generateReply(
            review.comment,
            review.starRating
          );

        await replyReview(
          token,
          review.name,
          aiReply
        );

        console.log("Reply Posted");
      }

    } catch (err) {

      console.log(
        err.response?.data ||
        err.message
      );

    }

  });

}

module.exports = {
  start,
};