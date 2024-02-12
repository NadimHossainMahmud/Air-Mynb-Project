const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { reviewSchema } = require("../schema.js");
const expressError = require("../utils/expressError");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errorMsg = error.details.map((el) => el.message).join(",");
    throw new expressError(400, errorMsg);
  } else {
    next();
  }
};

// Reviews
// Post review  Route

router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let neweReview = new Review(req.body.review);

    listing.reviews.push(neweReview);

    await neweReview.save();
    await listing.save();
    req.flash("success", "New review created");
    res.redirect(`/listings/${listing._id}`);
  })
);

//delete review route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "New review deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;
