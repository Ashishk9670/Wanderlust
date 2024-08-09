const express = require("express");
const app = express();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schemaValidation.js");
const Review = require("../models/Review.js");
const router = express.Router({ mergeParams: true });
const { isLoggedIn, isReviewAuthor } = require("../middlewares.js");
const reviewController = require("../controllers/reviews.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// review/post

router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.postReview)
);

// review delete
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;
