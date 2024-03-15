const mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    disprice:{
        type:String,
        required:true
    },
    image:[{
        type:String,
        required:true
    }],
    date:{
        type:Date,
        default:Date.now()  
    },
    color:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    sizes:{
        type:Array  ,
        required:true
    },
    status:{
       type:Boolean,
       default:true
    },
    category:{
        type:String,
        required:true
    }
})
const Product = mongoose.model("products",productSchema)


module.exports = Product