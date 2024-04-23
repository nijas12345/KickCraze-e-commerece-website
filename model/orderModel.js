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
        },
        totalPrice:{
            type:Number,
            default:true
        }      
    }],
    addressId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Address",
        required:true
        
    },
    totalPrice:{
        type:Number,
        default:true
    },
    payment:{
        type:String,
        required:true
    } ,
    orderedDate:{
        type:Date,
    },
        status:{
            type:String,
            enum:["pending","shipped","delivered","processing","cancelled","returned"],
            default:"pending"
        },
    isOrder:{
        type:Boolean,
        default:true
    },
    discountTotal:{
        type:String
    },
    couponId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coupon",       
    },
    wcTotal:{
        type:String
    },
    reason:{
        type:String
    },isPayment:{
        type:Boolean
    }    
})

module.exports = mongoose.model("Order",orderSchema)