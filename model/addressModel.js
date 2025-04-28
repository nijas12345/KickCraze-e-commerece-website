const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  houseName: {
    type: String,
  },
  isAddress: {
    type: Boolean,
    default: true,
  },
  street: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
    required: true,
  },
  pin: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Address", addressSchema);
