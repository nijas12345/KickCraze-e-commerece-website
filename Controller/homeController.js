const renderError = require("../helpers/errorHandling");
const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const WishList = require("../model/wishlistModel");
const StatusCode = require("../helpers/statusCode");

const loadHome = async (req, res) => {
  try {
    const userId = req.id;

    const products = await Product.find({ status: true });

    const wishlistCount = await WishList.countDocuments({ userId: userId });

    const categories = await Category.find({ delete: true });

    res.status(StatusCode.SUCCESS).render("home", {
      product: products,
      wishlistCount: wishlistCount,
      categories: categories,
      userId: userId,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  loadHome,
};
