const ExpressError = require("./utils/ExpressError");
const { productSchema, reviewSchema } = require("./schemas.js");
const Product = require("./models/product");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // console.log(req.path,req.originalUrl);
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first");
    return res.redirect("/login");
  }
  next();
};

//setting middleware for validation
module.exports.validateCampgroud = (req, res, next) => {
  //joi schema defined in schemas.js file as productSchema for validation purpose
  const { error } = productSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next(); // if validation successful we proceed to further
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/products/${id}`);
  }
  next();
};

//setting middleware for validation

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next(); // if validation successful we proceed to further
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  console.log("here", review);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/products/${id}`);
  }
  next();
};
