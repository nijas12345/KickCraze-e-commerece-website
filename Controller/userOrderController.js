const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Order = require("../model/orderModel");

const listOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("addressId")
      .populate("products.productId")
      .sort({ orderedDate: -1 });
    res.status(StatusCode.SUCCESS).render("orders", { orders: orders });
  } catch (error) {
    return renderError(res, error);
  }
};

const viewOrders = async (req, res) => {
  const orderId = req.query.id;

  try {
    const order = await Order.findOne({ _id: orderId })
      .populate("products.productId")
      .populate("userId")
      .populate("addressId");
    res.status(StatusCode.SUCCESS).render("viewOrders", { order: order });
  } catch (error) {
    return renderError(res, error);
  }
};

const statusOrders = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const option = req.body.selectedOption;

    await Order.findByIdAndUpdate(orderId, { status: option });
    res
      .status(StatusCode.SUCCESS)
      .json({ redirect: "/admin/view-orders?id=" + orderId });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  listOrders,
  viewOrders,
  statusOrders,
};
