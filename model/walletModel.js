const mongoose = require("mongoose");

const walletSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "userCollection",
    required: true,
  },
  details: [
    {
      amount: {
        type: Number,
        default: 0,
      },
      method: {
        type: String,
        enum: ["cancelled", "purchased", "refferal", "returned"],
      },
      date: {
        type: Date,
        default: Date.now(),
      },
      transactionType: {
        type: String,
        enum: ["Credited", "Debited"],
      },
    },
  ],
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet