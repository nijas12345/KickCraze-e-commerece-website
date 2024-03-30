const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"userCollection",
        required:true
    },
    products:[{      
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },     
        size:{
             type: Number,
            required:true
        },
        quantity:{
            type:Number,
            default:0
        },
        total:{
            type:Number,
            default:true
        }      
    }],
    addressId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address",
        required:true
        
    },
    payment:{
        type:String,
        required:true
    } ,
    createdAt:{
        type:Date,
        default:Date.now()
    },
        status:{
            type:String,
            enum:["pending","shipped","delivered","processing","cancelled"],
            default:"pending"
        },
    isOrder:{
        type:Boolean,
        default:true
    }
    
})

module.exports = mongoose.model("Order",orderSchema)