const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Order = require("../model/orderModel");
const moment = require("moment");

const daySales = async (req, res) => {
  try {
    const date = req.body.selectedOption;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (date == "month") {
      try {
        const currentDate = moment();

        const startOfMonth = currentDate.clone().startOf("month");

        const endOfMonth = currentDate.clone().endOf("month");

        const startOfMonthFormatted = startOfMonth.format("YYYY-MM-DD");

        const endOfMonthFormatted = endOfMonth.format("YYYY-MM-DD");

        const orders = await Order.find({
          orderedDate: {
            $gte: startOfMonthFormatted,
            $lte: endOfMonthFormatted,
          },
          status: "delivered",
        }).populate("userId");

        let orderOriginalPrice = 0;
        let orderDiscountPrice = 0;
        orders.forEach((order) => {
          orderOriginalPrice += parseInt(order.totalPrice);
          if (order.discountTotal) {
            orderDiscountPrice += parseInt(order.discountTotal);
          } else {
            orderDiscountPrice += parseInt(order.wcTotal);
          }
        });

        totalDiscount = orderOriginalPrice - orderDiscountPrice;

        res.status(StatusCode.SUCCESS).render("salesReport", {
          orders: orders,
          orderOriginalPrice: orderOriginalPrice,
          orderDiscountPrice: orderDiscountPrice,
          totalDiscount: totalDiscount,
        });
      } catch (error) {
        return renderError(res, error);
      }
    }

    if (date == "day") {
      const currentDate = moment();
      const startOfDay = currentDate.clone().startOf("day");
      const endOfDay = currentDate.clone().endOf("day");

      const startOfDayFormatted = startOfDay.toDate();
      const endOfDayFormatted = endOfDay.toDate();

      const orders = await Order.find({
        orderedDate: {
          $gte: startOfDayFormatted, // Greater than or equal to the start of the day
          $lt: endOfDayFormatted, // Less than the end of the day
        },
        status: "delivered",
      }).populate("userId");

      let orderOriginalPrice = 0;
      let orderDiscountPrice = 0;
      orders.forEach((order) => {
        orderOriginalPrice += parseInt(order.totalPrice);
        if (order.discountTotal) {
          orderDiscountPrice += parseInt(order.discountTotal);
        } else {
          orderDiscountPrice += parseInt(order.wcTotal);
        }
      });

      totalDiscount = orderOriginalPrice - orderDiscountPrice;

      res.status(StatusCode.SUCCESS).render("salesReport", {
        orders: orders,
        orderOriginalPrice: orderOriginalPrice,
        orderDiscountPrice: orderDiscountPrice,
        totalDiscount: totalDiscount,
      });
    }

    if (date == "weak") {
      const currentDate = moment();
      const startOfWeek = currentDate.clone().startOf("week");

      const endOfWeek = currentDate.clone().endOf("week");

      const startOfWeekFormatted = startOfWeek.format("YYYY-MM-DD");
      const endOfWeekFormatted = endOfWeek.format("YYYY-MM-DD");

      const orders = await Order.find({
        orderedDate: {
          $gte: startOfWeekFormatted, // Greater than or equal to the start date of the week
          $lte: endOfWeekFormatted, // Less than or equal to the end date of the week
        },
        status: "delivered",
      }).populate("userId");

      let orderOriginalPrice = 0;
      let orderDiscountPrice = 0;
      orders.forEach((order) => {
        orderOriginalPrice += parseInt(order.totalPrice);
        if (order.discountTotal) {
          orderDiscountPrice += parseInt(order.discountTotal);
        } else {
          orderDiscountPrice += parseInt(order.wcTotal);
        }
      });

      totalDiscount = orderOriginalPrice - orderDiscountPrice;

      res.status(StatusCode.SUCCESS).render("salesReport", {
        orders: orders,
        orderOriginalPrice: orderOriginalPrice,
        orderDiscountPrice: orderDiscountPrice,
        totalDiscount: totalDiscount,
      });
    }

    if (date == "year") {
      const currentDate = moment(); // Get the current date
      const startOfYear = currentDate.clone().startOf("year"); // Get the start of the current year
      const endOfYear = currentDate.clone().endOf("year"); // Get the end of the current year

      const startOfYearFormatted = startOfYear.format("YYYY-MM-DD"); // Format start of year
      const endOfYearFormatted = endOfYear.format("YYYY-MM-DD"); // Format end of year

      const orders = await Order.find({
        orderedDate: {
          $gte: startOfYearFormatted, // Greater than or equal to the start date of the year
          $lte: endOfYearFormatted, // Less than or equal to the end date of the year
        },
        status: "delivered",
      });

      let orderOriginalPrice = 0;
      let orderDiscountPrice = 0;
      orders.forEach((order) => {
        orderOriginalPrice += parseInt(order.totalPrice);
        if (order.discountTotal) {
          orderDiscountPrice += parseInt(order.discountTotal);
        } else {
          orderDiscountPrice += parseInt(order.wcTotal);
        }
      });

      totalDiscount = orderOriginalPrice - orderDiscountPrice;
      res.status(StatusCode.SUCCESS).render("salesReport", {
        orders: orders,
        orderOriginalPrice: orderOriginalPrice,
        orderDiscountPrice: orderDiscountPrice,
        totalDiscount: totalDiscount,
      });
    }

    if (startDate !== "") {
      const startdate = startDate;
      const enddate = endDate;

      const orders = await Order.find({
        orderedDate: {
          $gte: startdate, // Greater than or equal to the start date of the year
          $lte: enddate, // Less than or equal to the end date of the year
        },
        status: "delivered",
      });

      let orderOriginalPrice = 0;
      let orderDiscountPrice = 0;
      orders.forEach((order) => {
        orderOriginalPrice += parseInt(order.totalPrice);
        if (order.discountTotal) {
          orderDiscountPrice += parseInt(order.discountTotal);
        } else {
          orderDiscountPrice += parseInt(order.wcTotal);
        }
      });

      res.status(StatusCode.SUCCESS).render("salesReport", {
        orders: orders,
        orderOriginalPrice: orderOriginalPrice,
        orderDiscountPrice: orderDiscountPrice,
        totalDiscount: totalDiscount,
      });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const salesReport = async (req, res) => {
  try {
    const orders = await Order.find({ status: "delivered" })
      .sort({ orderedDate: -1 })
      .populate("userId");
    console.log(orders);
    let orderOriginalPrice = 0;
    let orderDiscountPrice = 0;
    orders.forEach((order) => {
      orderOriginalPrice += parseInt(order.totalPrice);
      if (order.discountTotal) {
        orderDiscountPrice += parseInt(order.discountTotal);
      } else {
        orderDiscountPrice += parseInt(order.wcTotal);
      }
    });

    totalDiscount = orderOriginalPrice - orderDiscountPrice;

    res.status(StatusCode.SUCCESS).render("salesReport", {
      orders: orders,
      orderOriginalPrice: orderOriginalPrice,
      orderDiscountPrice: orderDiscountPrice,
      totalDiscount,
    });
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  daySales,
  salesReport,
};
