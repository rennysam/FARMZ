const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Product = require("../models/product");
const products = require("../controllers/products");
const { isLoggedIn, isAuthor, validateCampgroud } = require("../middleware");
const multer = require("multer"); //https://github.com/expressjs/multer
const { storage } = require("../cloudinary");
const upload = multer({ storage }); //Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.

// router.get('/',catchAsync(products.index));
// router.post('/',isLoggedIn,validateCampgroud,catchAsync(products.createProduct));
//since these above 2 routes have same path we can route these in a fancy way using router.route
router
  .route("/")
  .get(catchAsync(products.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampgroud,
    catchAsync(products.createProduct)
  );
// .post(upload.array('image'),(req,res)=>{  //make sure input name (here-'image') matches the name in form
//     console.log(req.body, req.files);  //without multer req.body will be an empty object bcz enctype of the form is set to multipart so we need multer middleware to handle these
//     res.send("IT Worked!!");  //if we use arry those files will we stores in req.files
// })

router.get("/new", isLoggedIn, products.renderNewForm);

router
  .route("/:id")

  .get(catchAsync(products.showProduct))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampgroud,
    catchAsync(products.updateProduct)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(products.deleteProduct));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(products.renderEditForm)
);

router.get("/:id/cart", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  req.flash("success", "Added product to cart");
  console.log(product);
  if (product.title == "Apple") {
    res.redirect("https://buy.stripe.com/test_fZe14vgLffZc3vybIJ");
  } else {
    res.redirect("https://buy.stripe.com/test_dR628z2UpeV84zCfYY");
  }
});

module.exports = router;
