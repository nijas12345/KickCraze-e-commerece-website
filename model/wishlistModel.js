const mongoose = require("mongoose")
const wishlistSchema = new mongoose.Schema({

    userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"userCollection",
    required:true
    },
    productId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Product",
        required:true
    }
})

module.exports = mongoose.model("wishlist",wishlistSchema)