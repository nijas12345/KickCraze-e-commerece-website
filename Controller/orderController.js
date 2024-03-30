const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const jwt = require("jsonwebtoken")
const Cart = require('../model/cartModel')
const Address = require("../model/addressModel")
const Order = require("../model/orderModel")
const { loadLogin } = require('./userController')

const loadSuccess = async (req,res)=>{
  try {
    const userId = req.id
     console.log('hai');
     console.log(userId);
     const orderId = req.query.orderId
     
     const orders = await Order.findById(orderId).populate("products.productId").populate("addressId")
     const cartData = await Cart.find({userId:userId}).populate("productId")
     console.log("cartData",cartData);
     
     cartData.forEach(async cart=>{
      const productId = cart.productId
      const quantity = cart.quantity
      
      const product = await Product.findById(productId)

      if(!product){
        console.log("no productID");
      }
      else{
        product.stock -= quantity
        await product.save()
      }
      console.log(product.stock);
     })

     
   
     
     const cart = await Cart.deleteOne({userId:userId})
     
     console.log(cart);
     console.log("orders",orders);
     let total = 0
     orders.products.forEach((order)=>{
         total = total + order.total
     })
     console.log(total);
     res.render("orderSuccess",{orders:orders,total:total})
  } catch (error) {
    console.log(error);
  }
}
const insertOrder = async (req,res)=>{
    try {
        
        let userId = req.id
       if(req.body.addressId == null){
         const address = new Address({
            userId:userId,
            name:req.body.name,
            houseName:req.body.houseName,
            state:"kerala",
            pin:req.body.pin,
            mobile:req.body.phoneNo
         })
         await address.save()
         console.log(req.body.name);
         let orderAddress = await Address.find({name:req.body.name,houseName:req.body.houseName,pin:req.body.pin})
         console.log("orderaddress",orderAddress);
         const cart = await Cart.find({userId:userId})
         
         const order = new Order({
            userId:userId,
            products:cart.map((cart)=>({
              productId:cart.productId,
              size:cart.size,
              quantity:cart.quantity,
              total:cart.total
            })),
            addressId:orderAddress[0]._id,
            payment : req.body.paymentId
         })        
         console.log("order",order);
          const orderData = await order.save()
          console.log("orderData",orderData);
          res.status(200).json({success:true ,redirect:`/order-success?orderId=${orderData._id}`})
       }
       else{
              console.log("hello");
            console.log("addressId",req.body.addressId);
            const addressId = req.body.addressId
            const cart = await Cart.find({userId:userId})
            const address = await Address.findOne({_id:addressId})
            console.log(address);

            const order = new Order({
              userId:userId,
              products:cart.map((cart)=>({
                productId:cart.productId,
                size:cart.size,
                quantity:cart.quantity,
                total:cart.total,
                
              })),
              addressId:address._id,
              payment:req.body.paymentId         
       })
       const orderData = await order.save()
       
       console.log(orderData);
       res.status(200).json({success:true ,redirect:`/order-success?orderId=${orderData._id}`})
      
    }
   } catch (error) {
        console.log(error);
    }
}

const deleteOrder = async (req,res)=>{
   console.log(req.id);
   let userId = req.id
   const order = await Order.find({userId:userId})
   const id = req.query.id
   
   if(order){
     orderData = await Order.findByIdAndUpdate(id,{status:"cancelled",isOrder:false})
     console.log(orderData);
    res.redirect("/userProfile")
   }
}
module.exports = {
    
    insertOrder,
    loadSuccess,
    deleteOrder
  }