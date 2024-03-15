const mongoose = require("mongoose")

const CategorySchema  = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    delete:{
        type:Boolean,
        default:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
})


module.exports = mongoose.model("Category",CategorySchema)