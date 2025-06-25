const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Category = require("../model/categoryModel");
const Order = require("../model/orderModel");
const Product = require("../model/productModel");
const Wallet = require("../model/walletModel");

const cancelOrder = async (req, res) => {
  try {
    const userId = req.id;
    if (req.body.reason == "reason1") {
      reason = "Shoes has no expected size";
    } else if (req.body.reason == "reason2") {
      reason = "shoe is damaged";
    } else {
      reason = "Quality is not good";
    }

    const orderId = req.body.orderId;
    const orders = await Order.findByIdAndUpdate(orderId, {
      status: "cancelled",
      reason: reason,
    });
    const orderOne = await Order.findByIdAndUpdate(orderId, {}, { new: true });
    await orderOne.populate("products.productId");
    orderOne.products.forEach(async (product) => {
      const productId = product.productId._id;
      const stock = product.productId.stock + product.quantity;
      product.quantity = 0;
      await Product.findByIdAndUpdate(productId, {
        stock: stock,
      });
    });

    let wallet;

    wallet = await Wallet.findOne({ userId: userId });

    if (wallet) {
    } else {
      const newWallet = new Wallet({
        userId: userId,
        details: [
          {
            amount: 0,
          },
        ],
      });

      await newWallet.save();
    }

    if (orders.payment == "online-payment") {
      if (orders.wcTotal) {
        const wallet = await Wallet.findOne({ userId: userId });

        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.wcTotal,
                transactionType: "Credited",
                method: "cancelled",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );

        res
          .status(StatusCode.SUCCESS)
          .json({ status: "cancelled", message: 1 });
      } else {
        const wallet = await Wallet.findOne({ userId: userId });
        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.discountTotal,
                transactionType: "Credited",
                method: "cancelled",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );
        res
          .status(StatusCode.SUCCESS)
          .json({ status: "cancelled", message: 1 });
      }
    } else if (orders.payment == "wallet-payment") {
      if (orders.wcTotal) {
        const wallet = await Wallet.findOne({ userId: userId });

        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.wcTotal,
                transactionType: "Credited",
                method: "cancelled",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );

        res
          .status(StatusCode.SUCCESS)
          .json({ status: "cancelled", message: 1 });
      } else {
        const wallet = await Wallet.findOne({ userId: userId });
        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.discountTotal,
                transactionType: "Credited",
                method: "cancelled",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );
        res
          .status(StatusCode.SUCCESS)
          .json({ status: "cancelled", message: 1 });
      }
    } else {
      res.status(StatusCode.SUCCESS).json({ status: "cancelled" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const returnOrder = async (req, res) => {
  try {
    const userId = req.id;

    if (req.body.reason == "reason1") {
      reason = "Shoes has no expected size";
    } else if (req.body.reason == "reason2") {
      reason = "shoe is damaged";
    } else {
      reason = "Quality is not good";
    }

    const orderId = req.body.orderId;
    const orders = await Order.findByIdAndUpdate(orderId, {
      status: "returned",
      reason: reason,
    });
    await orders.save();

    const order = await Order.findOne({ _id: orderId });

    let wallet;

    wallet = await Wallet.findOne({ userId: userId });

    if (wallet) {
    } else {
      const newWallet = new Wallet({
        userId: userId,
        details: [
          {
            amount: 0,
          },
        ],
      });

      await newWallet.save();
    }

    if (orders) {
      if (orders.wcTotal) {
        const wallet = await Wallet.findOne({ userId: userId });
        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.wcTotal,
                transactionType: "Credited",
                method: "returned",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );
        res.status(StatusCode.SUCCESS).json({
          status: "returned",
          message:
            "Your order is returned and amount has been credited into wallet",
        });
      } else {
        const wallet = await Wallet.findOne({ userId: userId });
        await Wallet.findByIdAndUpdate(
          wallet._id,
          {
            $push: {
              details: {
                amount: orders.discountTotal,
                transactionType: "Credited",
                method: "returned",
                date: Date.now(),
              },
            },
          },
          { new: true } // To return the updated document
        );
        res.status(StatusCode.SUCCESS).json({
          status: "returned",
          message:
            "Your order is returned and amount has been credited into wallet",
        });
      }
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const viewOrder = async (req, res) => {
  try {
    const categories = await Category.find({ delete: true });
    const orderId = req.query.id;

    const order = await Order.findOne({ _id: orderId })
      .populate("products.productId")
      .populate("addressId");
    let total = 0;
    order.products.forEach((order) => {
      total = total + order.total;
    });
    console.log(order);

    if (order) {
      res.status(StatusCode.SUCCESS).render("orderDetails", {
        order: order,
        total: total,
        categories: categories,
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  cancelOrder,
  returnOrder,
  viewOrder,
};
