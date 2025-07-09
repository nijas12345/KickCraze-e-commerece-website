const renderError = require("../helpers/errorHandling");
const StatusCode = require("../helpers/statusCode");
const Coupon = require("../model/couponModel");

const loadCoupon = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isCoupon: true }).sort({
      createdAt: -1,
    });
    res
      .status(StatusCode.SUCCESS)
      .render("coupon", { coupons: coupons, message: undefined });
  } catch (error) {
    return renderError(res, error);
  }
};
const insertCoupon = async (req, res) => {
  try {
    const couponCode = req.body.code;
    const couponDescription = req.body.description;
    const couponDiscount = req.body.discount,
      couponExpiry = req.body.expiryDate;

    const maximumAmount = req.body.maxAmount;
    const minimumAmount = req.body.minAmount;

    let coupons = await Coupon.findOne({ couponCode: req.body.code });
    if (coupons) {
      res
        .status(StatusCode.SUCCESS)
        .json({ status: "failed", message: "Coupon code is already exist" });
    } else {
      const coupon = new Coupon({
        couponCode: couponCode,
        couponDescription: couponDescription,
        couponDiscount: couponDiscount,
        couponExpiry: couponExpiry,
        maximumAmount: maximumAmount,
        minimumAmount: minimumAmount,
      });
      await coupon.save();

      res.status(StatusCode.SUCCESS).json({ status: "success" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};

const editCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const coupon = await Coupon.findOne({ _id: couponId });

    res
      .status(StatusCode.SUCCESS)
      .render("editCoupon", { coupon: coupon, message: undefined });
  } catch (error) {
    return renderError(res, error);
  }
};
const insertEditedCoupon = async (req, res) => {
  try {
    let couponId = req.body.id;
    let couponCode = req.body.code;
    let couponDescription = req.body.description;
    let couponDiscount = req.body.discount;
    let dateParts = req.body.expiry.split("/"); // Split the date string into parts

    // Extract year, month, and day from the date string parts
    let year = parseInt(dateParts[2]); // Extract year
    let month = parseInt(dateParts[0]) - 1; // Extract month (subtract 1 because months are zero-based)
    let day = parseInt(dateParts[1]); // Extract day

    let couponExpiry = new Date(year, month, day);

    let maximumAmount = req.body.maxAmount;
    let minimumAmount = req.body.minAmount;
    let coupon = await Coupon.findOne({
      couponCode: couponCode,
      _id: { $ne: couponId },
      isCoupon: true,
    });
    if (coupon) {
      res.status(StatusCode.SUCCESS).json({
        status: "failed",
        message: "Coupon code is already exist",
      });
    } else {
      const coupon = await Coupon.findByIdAndUpdate(
        couponId,
        {
          couponCode: couponCode,
          couponDescription: couponDescription,
          couponDiscount: couponDiscount,
          couponExpiry: couponExpiry,
          maximumAmount: maximumAmount,
          minimumAmount: minimumAmount,
        },
        { new: true }
      );

      res.status(StatusCode.SUCCESS).json({ status: "success" });
    }
  } catch (error) {
    return renderError(res, error);
  }
};
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;

    await Coupon.findByIdAndUpdate(couponId, {
      isCoupon: false,
    });
    res.redirect("/admin/add-coupon");
  } catch (error) {
    return renderError(res, error);
  }
};

module.exports = {
  loadCoupon,
  insertCoupon,
  editCoupon,
  deleteCoupon,
  insertEditedCoupon,
};
