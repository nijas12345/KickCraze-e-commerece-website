const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Address = require("../model/addressModel");
const Cart = require("../model/cartModel");
const Category = require("../model/categoryModel");
const Coupon = require("../model/couponModel");
const Order = require("../model/orderModel");

const loadUnSuccess = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const categories = await Category.find({ delete: true });

    const orders = await Order.findById(orderId)
      .populate("products.productId")
      .populate("addressId");
    res.render("orderPending", { orders: orders, categories: categories });
  } catch (error) {
    return renderError(res, error);
  }
};

const failureOrder = async (req, res) => {
  try {
    const userId = req.id;
    const couponId = req.session.couponId;

    let total = req.body.total;

    let totalPrice = req.body.totalPrice;

    // Check if address ID is provided
    if (req.body.addressId === null) {
      // Create new address
      const address = new Address({
        userId: userId,
        name: req.body.name,
        houseName: req.body.HouseName,
        state: "kerala",
        pin: req.body.pin,
        mobile: req.body.phoneNo,
      });
      await address.save();

      // Retrieve order address
      let orderAddress = await Address.find({
        name: req.body.name,
        houseName: req.body.HouseName,
        pin: req.body.pin,
      });

      // Retrieve cart items
      const cart = await Cart.find({ userId: userId });

      // Check if coupon is applied
      if (couponId === null) {
        // Create order without coupon

        const order = new Order({
          userId: userId,
          products: cart.map((cartItem) => ({
            productId: cartItem.productId,
            size: cartItem.size,
            quantity: cartItem.quantity,
            total: cartItem.total,
          })),
          totalPrice: totalPrice,
          wcTotal: total,
          addressId: orderAddress[0]._id,
          payment: req.body.paymentId,
          isPayment: false,
        });
        const orderData = await Order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-unSuccess?orderId=${orderData._id}`,
        });
      } else {
        // Fetch coupon details

        await Coupon.findByIdAndUpdate(couponId, {
          $addToSet: { users: { userId: userId } },
        });
        // Create order with coupon
        const order = new Order({
          userId: userId,
          products: cart.map((cartItem) => ({
            productId: cartItem.productId,
            size: cartItem.size,
            quantity: cartItem.quantity,
            total: cartItem.total,
          })),
          totalPrice: totalPrice,
          discountTotal: total,
          couponId: couponId,
          addressId: orderAddress[0]._id,
          payment: req.body.paymentId,
          isPayment: false,
        });

        const orderData = await Order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-unSuccess?orderId=${orderData._id}`,
        });
      }
    } else {
      if (couponId == null) {
        const addressId = req.body.addressId;
        const cart = await Cart.find({ userId: userId });

        const order = new Order({
          userId: userId,
          products: cart.map((cartItem) => ({
            productId: cartItem.productId,
            size: cartItem.size,
            quantity: cartItem.quantity,
            total: cartItem.total,
            totalPrice: cartItem.totalPrice,
          })),
          totalPrice: totalPrice,
          wcTotal: total,
          addressId: addressId,
          payment: req.body.paymentId,
          isPayment: false,
        });
        const orderData = await Order.save();

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/rOrder-unSuccess?orderId=${orderData._id}`,
        });
      } else {
        await Coupon.findByIdAndUpdate(couponId, {
          $addToSet: { users: { userId: userId } },
        });
        const addressId = req.body.addressId;
        const cart = await Cart.find({ userId: userId });

        const order = new Order({
          userId: userId,
          products: cart.map((cartItem) => ({
            productId: cartItem.productId,
            size: cartItem.size,
            quantity: cartItem.quantity,
            total: cartItem.total,
            totalPrice: cartItem.totalPrice,
          })),
          totalPrice: totalPrice,
          discountTotal: total,
          couponId: couponId,
          addressId: addressId,
          payment: req.body.paymentId,
          isPayment: false,
        });

        const orderData = await Order.save();

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-unSuccess?orderId=${orderData._id}`,
        });
      }
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  failureOrder,
  loadUnSuccess,
};
