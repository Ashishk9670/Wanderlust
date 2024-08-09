const express = require("express");
const app = express();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schemaValidation.js");
const Review = require("../models/Review.js");
const router = express.Router();
const { isLoggedIn, isOwner } = require("../middlewares.js");
const { equal } = require("joi");
const listingController = require("../controllers/listings.js");
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// router.get("/", wrapAsync(listingController.index));
router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.submitNewListingForm)
  );

// New listing
router.get("/new", isLoggedIn, listingController.newListingForm);

router
  .route("/:id")
  .get(wrapAsync(listingController.showIndividualListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

// Edit and Update
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
