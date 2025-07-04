const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: 1,
  },
  Date: {
    type: Date,
    default: Date.now,
  },
  referal: {
    type: String,
  },
});

const User = mongoose.model("userCollection", userSchema);

module.exports = User