const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Category = require("../model/categoryModel");
const Wishlist = require("../model/wishlistModel");

const insertWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const productId = req.body.productId;

    const wishlistData = await Wishlist.findOne({
      userId: userId,
      productId: productId,
    });
    if (wishlistData) {
      res.status(StatusCode.SUCCESS).json({ success: true });
    } else {
      const wishlistData = new Wishlist({
        userId: userId,
        productId: productId,
      });
      await wishlistData.save();
    }
    res.status(StatusCode.SUCCESS).json({ success: true });
  } catch (error) {
    return renderError(res, error);
  }
};

const showWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const categories = await Category.find({ delete: true });
    const wishlistData = await Wishlist.find({ userId: userId })
      .populate("userId")
      .populate("productId");

    res.status(StatusCode.SUCCESS).render("wishlist", {
      wishlistData: wishlistData,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const removeWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const productId = req.query.id;
    await Wishlist.findOneAndDelete({ productId: productId });

    await Wishlist.find({ userId: userId })
      .populate("userId")
      .populate("productId");
    res.redirect("/show-wishlist");
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  insertWishlist,
  showWishlist,
  removeWishlist,
};
