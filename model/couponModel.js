const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
  },
  couponDescription: {
    type: String,
  },
  couponDiscount: {
    type: String,
  },
  couponExpiry: {
    type: Date,
  },
  maximumAmount: {
    type: String,
  },
  minimumAmount: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isCoupon: {
    type: Boolean,
    default: true,
  },
  users: [
    {
      userId: {
        type: String,
      },
    },
  ],
});

couponSchema.pre("save", function (next) {
  if (this.couponExpiry && this.couponExpiry <= new Date()) {
    this.isCoupon = false;
  }
  next();
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon