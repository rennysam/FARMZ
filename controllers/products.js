const Product = require("../models/product");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const products = await Product.find({});
  res.render("products/index", { products });
};

module.exports.renderNewForm = (req, res) => {
  res.render("products/new");
};

module.exports.createProduct = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.product.location,
      limit: 1,
    })
    .send();

  const product = new Product(req.body.product);
  product.geometry = geoData.body.features[0].geometry;
  product.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  })); //it will make an array which will contain objects(in which we have url and filename of image)
  product.author = req.user._id;
  // console.log(product);
  await product.save();
  req.flash("success", "successfully made a new product!");
  res.redirect(`/products/${product._id}`);
};

module.exports.showProduct = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate({
      path: "reviews", //populating reviews of this product
      populate: {
        path: "author", //nested population for author of reviews
      },
    })
    .populate("author"); //populating author of this product
  //console.log(product);
  if (!product) {
    req.flash("error", "can't find that product");
    return res.redirect("/products");
  }
  //console.log(product)
  res.render("products/show", { product });
};

module.exports.renderEditForm = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    req.flash("error", "can't find that product");
    return res.redirect("/products");
  }
  res.render("products/edit", { product });
};

module.exports.updateProduct = async (req, res, next) => {
  const { id } = req.params;
  // console.log(req.body);
  const product = await Product.findByIdAndUpdate(id, req.body.product, {
    runValidators: true,
    new: true,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  product.images.push(...imgs); //push on existing images
  await product.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await product.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    // console.log(product);
  }
  req.flash("success", "successfully updated a product!");
  //res.send(req.body.product);
  res.redirect(`/products/${product._id}`);
};

module.exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);
  req.flash("success", "successfully deleted a product");
  res.redirect("/products");
};
