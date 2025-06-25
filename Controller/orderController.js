const Category = require("../model/categoryModel");
const Product = require("../model/productModel");
const Cart = require("../model/cartModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const { razorpayInstance } = require("../helpers/razorpay");
const Wallet = require("../model/walletModel");
const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");

const loadSuccess = async (req, res) => {
  try {
    const userId = req.id;

    const orderId = req.query.orderId;
    const categories = await Category.find({ delete: true });

    const orders = await Order.findById(orderId)
      .populate("products.productId")
      .populate("addressId");
    if (orders.isPayment == false) {
      await Order.findByIdAndUpdate(orderId, {
        isPayment: true,
      });
    }

    const cartData = await Cart.find({ userId: userId }).populate("productId");

    for (const cart of cartData) {
      const productId = cart.productId;
      const quantity = cart.quantity;

      const product = await Product.findById(productId);

      if (!product) {
      } else {
        product.stock -= quantity; // Subtract quantity from stock
        await product.save();
      }
    }

    await Cart.deleteMany({ userId: userId });

    let total = 0;
    orders.products.forEach((order) => {
      total = total + order.total;
    });

    res.render("orderSuccess", {
      orders: orders,
      total: total,
      categories: categories,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const insertOrder = async (req, res) => {
  try {
    const userId = req.id;
    const couponId = req.session.couponId;
    const totalPrice = req.body.totalPrice;

    let total = req.body.total;

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

      // This will print the current timestamp in ISO 8601 format

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
        });
        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
        });
      } else {
        // Fetch coupon details

        // This will print the current timestamp in ISO 8601 format
        await Coupon.findByIdAndUpdate(couponId, {
          $addToSet: { users: { userId: userId } },
        });
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
        });

        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
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
          })),
          totalPrice: totalPrice,
          wcTotal: total,
          addressId: addressId,
          payment: req.body.paymentId,
        });
        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
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
          })),
          totalPrice: totalPrice,
          discountTotal: total,
          couponId: couponId,
          addressId: addressId,
          payment: req.body.paymentId,
        });

        const orderData = await order.save();

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
        });
      }
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const onlineOrder = async (req, res) => {
  try {
    const amount = req.body.total * 100;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: req.id,
    };

    razorpayInstance.orders.create(options, function (err, order) {
      if (!err) {
        res.status(StatusCode.SUCCESS).json({ order });
      } else {
        res
          .status(StatusCode.BAD_REQUEST)
          .send({ success: false, msg: "something went wrong" });
      }
    });
  } catch (error) {
    return renderError(res, error);
  }
};

const walletPayment = async (req, res) => {
  try {
    const userId = req.id;
    const couponId = req.session.couponId;
    const totalPrice = req.body.totalPrice;

    let total = req.body.total;
    total = parseInt(total);

    let wallets = await Wallet.findOne({ userId: userId });
    if (wallets) {
      let walletId = wallets._id;

      let creditedAmount = 0;
      let debitedAmount = 0;

      wallets.details.forEach((wallet) => {
        if (wallet.transactionType == "Credited") {
          creditedAmount += wallet.amount;
        } else {
          debitedAmount += wallet.amount;
        }
      });
      let totalAmount = creditedAmount - debitedAmount;

      if (total > totalAmount) {
        res
          .status(StatusCode.SUCCESS)
          .json({ success: true, message: "Wallet has insufficient balance" });
      } else {
        let updatedAmount = total;
        const wallet = await Wallet.findByIdAndUpdate(
          walletId,
          {
            $push: {
              details: {
                amount: updatedAmount,
                transactionType: "Debited",
                method: "purchased",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );

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
            });
            const orderData = await order.save();
            return res.status(StatusCode.SUCCESS).json({
              success: true,
              redirect: `/order-success?orderId=${orderData._id}`,
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
            });

            const orderData = await order.save();
            return res.status(StatusCode.SUCCESS).json({
              success: true,
              redirect: `/order-success?orderId=${orderData._id}`,
            });
          }
        } else {
          if (couponId == null) {
            const addressId = req.body.addressId;
            const cart = await Cart.find({ userId: userId });
            await Address.findOne({ _id: addressId });

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
              addressId: addressId,
              payment: req.body.paymentId,
            });
            const orderData = await order.save();
            return res.status(StatusCode.SUCCESS).json({
              success: true,
              redirect: `/order-success?orderId=${orderData._id}`,
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
              })),
              totalPrice: totalPrice,
              discountTotal: total,
              couponId: couponId,
              addressId: addressId,
              payment: req.body.paymentId,
            });

            const orderData = await order.save();

            return res.status(StatusCode.SUCCESS).json({
              success: true,
              redirect: `/order-success?orderId=${orderData._id}`,
            });
          }
        }
      }
    } else {
      res
        .status(StatusCode.SUCCESS)
        .json({ success: true, message: "Wallet has insufficient balance" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const onlineSuccess = async (req, res) => {
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
        });
        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
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
        });

        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
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
        });
        const orderData = await order.save();
        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
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
        });

        const orderData = await order.save();

        return res.status(StatusCode.SUCCESS).json({
          success: true,
          redirect: `/order-success?orderId=${orderData._id}`,
        });
      }
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  insertOrder,
  loadSuccess,
  onlineOrder,
  walletPayment,
  onlineSuccess,
};
