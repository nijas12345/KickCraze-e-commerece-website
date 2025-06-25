const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
const Coupon = require("../model/couponModel");
const wishlist = require("../model/wishlistModel");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");

const loadCart = async (req, res) => {
  try {
    const userId = req.id;
    const carts = await Cart.find({ userId: userId }).populate("productId");
    const categories = await Category.find({ delete: true });

    let totalCart = 0;
    let totalPrice = 0;
    carts.forEach((cart) => {
      totalCart = Math.round(totalCart + cart.total);
      totalPrice = Math.round(totalPrice + cart.totalPrice);
    });
    
    const discount = Math.round(totalPrice - totalCart);
    res.status(StatusCode.SUCCESS).render("cart", {
      carts: carts,
      totalCart: totalCart,
      totalPrice: totalPrice,
      discount: discount,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};
const insertCart = async (req, res) => {
  try {
    let userId = req.id;

    const productId = req.body.productId;

    const quantity = parseInt(req.body.quantity);
    const size = parseInt(req.body.size);
    const cart = await Cart.findOne({
      userId: userId,
      productId: productId,
      size: size,
    }).populate("productId");
    if (cart) {
      if (cart.quantity >= 6) {
      } else {
        const disprice = parseInt(cart.productId.disprice);
        const price = parseInt(cart.productId.price);

        cart.quantity += quantity;
        cart.total = cart.quantity * disprice;
        cart.totalPrice = cart.quantity * price;

        await cart.save();
      }
    } else {
      const product = await Product.findOne({ _id: productId });
      const total = quantity * product.disprice;
      const totalPrice = quantity * product.price;

      const carts = new Cart({
        userId: userId,
        productId: productId,
        size: size,
        isTrue: 1,
        quantity: quantity,
        total: total,
        totalPrice: totalPrice,
      });
      await carts.save();
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.id;

    const { quantity, productId, size } = req.body;
    if (req.body.quantity == "") {
    } else {
      const updateCart = await Cart.findOne({
        userId: userId,
        productId: productId,
        size: size,
      }).populate("productId");

      if (updateCart) {
        const disprice = parseInt(updateCart.productId.disprice);
        const price = parseInt(updateCart.productId.price);
        const updateQuantity = parseInt(quantity);
        updateCart.quantity = updateQuantity;
        updateCart.total = updateCart.quantity * disprice;
        updateCart.totalPrice = updateCart.quantity * price;
        const cart = await updateCart.save();

        const carts = await Cart.find({ userId: userId });

        let totalCart = 0;
        let totalPrice = 0;
        carts.forEach((cart) => {
          totalCart = totalCart + cart.total;
          totalPrice = totalPrice + cart.totalPrice;
        });
        discount = totalPrice - totalCart;

        res.status(StatusCode.SUCCESS).json({
          total: updateCart.total,
          quantity: updateCart.quantity,
          totalCart: totalCart,
          totalPrice: totalPrice,
          discount: discount,
        });
      }
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const deleteCart = async (req, res) => {
  const userId = req.id;

  const productId = req.body.productId;

  const size = req.body.size;
  const cart = await Cart.find({ userId: userId });

  if (cart) {
    await Cart.deleteOne({ productId: productId, size: size });

    res.status(StatusCode.SUCCESS).json({ success: true });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.id;
    await Cart.deleteMany({ userId: userId });
    res.redirect("/home");
  } catch (error) {
    return renderError(res, error);
  }
};

const checkOut = async (req, res) => {
  try {
    const categories = await Category.find({ delete: true });
    const userId = req.id;
    const wishlistCount = await wishlist.countDocuments({ userId: userId });

    req.session.couponId = null;
    const address = await Address.find({ userId: userId });
    const carts = await Cart.find({ userId: userId }).populate("productId");

    let totalCart = 0;
    let totalPrice = 0;
    carts.forEach((cart) => {
      totalCart = Math.round(totalCart + cart.total);
      totalPrice = Math.round(totalPrice + cart.totalPrice);
    });
    if (totalCart == 0) {
      res.redirect("/home");
    }

    let coupons = await Coupon.find({
      "users.userId": { $nin: [userId] },
      isCoupon: true,
    });
    if (coupons) {
      let couponData = [];
      coupons.forEach((coupon) => {
        if (
          totalCart < parseInt(coupon.maximumAmount) &&
          totalCart >= parseInt(coupon.minimumAmount) &&
          coupon.isCoupon === true
        ) {
          couponData.push({
            couponId: coupon._id,
            couponCode: coupon.couponCode,
            couponDiscount: coupon.couponDiscount,
          });
        }
      });

      res.status(StatusCode.SUCCESS).render("checkout", {
        address: address,
        carts: carts,
        totalCart: totalCart,
        couponData: couponData,
        totalPrice: totalPrice,
        wishlistCount: wishlistCount,
        categories: categories,
      });
    } else {
      res.render("checkout", {
        address: address,
        carts: carts,
        totalCart: totalCart,
        couponData: couponData,
        totalPrice: totalPrice,
        wishlistCount: wishlistCount,
        categories: categories,
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const userId = req.id;
    const couponId = req.body.selectedId;
    req.session.couponId = couponId;
    const total = req.body.total;

    const coupon = await Coupon.findOne({ _id: couponId });

    const discountPercentage = Math.round(parseInt(coupon.couponDiscount));

    const couponPercentage = (discountPercentage / 100) * total;

    const couponDiscount = Math.round(total - (discountPercentage / 100) * total);

    await Coupon.findByIdAndUpdate(couponId, {
      $addToSet: { users: { userId: userId } },
    });

    res.status(StatusCode.SUCCESS).json({
      total: total,
      couponPercentage: couponPercentage,
      couponDiscount: couponDiscount,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const removeCoupon = async (req, res) => {
  try {
    const userId = req.id;
    const couponId = req.body.selectedId;
    req.session.couponId = null;
    const coupon = await Coupon.findOne({ _id: couponId });

    if (coupon) {
      await Coupon.findByIdAndUpdate(
        couponId,
        { $pull: { users: { userId: userId } } },
        { multi: true, new: true }
      );
    }
    res.status(StatusCode.SUCCESS).json({ redirect: "/checkout" });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  loadCart,
  insertCart,
  updateCart,
  deleteCart,
  checkOut,
  applyCoupon,
  removeCoupon,
  clearCart,
};
