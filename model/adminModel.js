const mongoose = require("mongoose");
const adminSchema = new mongoose.Schema({
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
  isAdmin: {
    type: Number,
    default: 1,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin
