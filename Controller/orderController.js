const User = require('../model/userModel')
const Admin = require("../model/adminModel")
const Category = require("../model/categoryModel")
const Product = require('../model/productModel')
const jwt = require("jsonwebtoken")
const Cart = require('../model/cartModel')
const Address = require("../model/addressModel")
const Order = require("../model/orderModel")
const { loadLogin } = require('./userController')
const Coupon = require('../model/couponModel')
const mongoose = require('mongoose')
const { concurrency } = require('sharp')
const {razorpayInstance} = require('../helpers/razorpay')
const Wallet = require('../model/walletModel')
const moment = require('moment')



const loadSuccess = async (req,res)=>{
  try {
    
    const userId = req.id
    const orderId = req.query.orderId
    const categories = await Category.find({delete: true})

     
     const orders = await Order.findById(orderId).populate("products.productId").populate("addressId")
     if(orders.isPayment == false){
       const orderData = await Order.findByIdAndUpdate(orderId,{isPayment:true})
     }
     
     const cartData = await Cart.find({userId:userId}).populate("productId")
     
     
     for (const cart of cartData) {
      const productId = cart.productId;
      const quantity = cart.quantity;
      
      const product = await Product.findById(productId);
      
  
      if (!product) {
          console.log("no productID");
      } else {
          product.stock -= quantity; // Subtract quantity from stock
          await product.save();
          console.log(product.stock);
      }
  }
  

  
   
     
     const cart = await Cart.deleteMany({userId:userId})
     
     console.log(cart);
    

     let total = 0
     orders.products.forEach((order)=>{
         total = total + order.total
     })
     
     
     res.render("orderSuccess",{orders:orders,total:total,categories:categories})
  } catch (error) {
    console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
  }
}


const loadUnSuccess = async(req,res)=>{
    try {
        const userId = req.id
    
     
     const orderId = req.query.orderId
     const categories = await Category.find({delete: true})
     
     const orders = await Order.findById(orderId).populate("products.productId").populate("addressId")
     const cartData = await Cart.find({userId:userId}).populate("productId")
     
     res.render('orderPending',{orders:orders,categories:categories})
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}
const insertOrder = async (req, res) => {
  try {
      const userId = req.id;
      const couponId = req.session.couponId
      const totalPrice = req.body.totalPrice
      
      let total = req.body.total;
      
          
      // Check if address ID is provided
      if (req.body.addressId === null) {

        
          // Create new address
          const address = new Address({
              userId: userId,
              name: req.body.name,
              houseName: req.body.houseName,
              state: "kerala",
              pin: req.body.pin,
              mobile: req.body.phoneNo
          });
          await address.save();

          // Retrieve order address
          let orderAddress = await Address.find({
              name: req.body.name,
              houseName: req.body.houseName,
              pin: req.body.pin
          });

          // Retrieve cart items
          const cart = await Cart.find({ userId: userId });

         // This will print the current timestamp in ISO 8601 format

          // Check if coupon is applied
          if (couponId === null) {
              // Create order without coupon
              
             
              const order = new Order({
                  userId: userId,
                  products: cart.map((cartItem) => ({
                      productId: cartItem.productId,
                      size: cartItem.size,
                      quantity: cartItem.quantity,
                      total: cartItem.total
                  })),
                  totalPrice:totalPrice,
                  wcTotal:total,
                  addressId: orderAddress[0]._id,
                  payment: req.body.paymentId,
                  
              });
              console.log("order",order.orderedDate);
              const orderData = await order.save();
              return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
          } else {
              // Fetch coupon details
              
              
              // This will print the current timestamp in ISO 8601 format
              const couponData = await Coupon.findByIdAndUpdate(couponId,
                { $addToSet: { users: { userId: userId } } }
            )
              const coupon = await Coupon.findById(couponId);
              // Create order with coupon
              const order = new Order({
                  userId: userId,
                  products: cart.map((cartItem) => ({
                      productId: cartItem.productId,
                      size: cartItem.size,
                      quantity: cartItem.quantity,
                      total: cartItem.total
                  })),
                  totalPrice:totalPrice,
                  discountTotal: total,
                  couponId:couponId,
                  addressId: orderAddress[0]._id,
                  payment: req.body.paymentId,
                  
              });
              
              console.log("order",order.orderedDate);
              const orderData = await order.save();
              return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
          }
      } else {


        
        if(couponId == null){
         
          
          const addressId = req.body.addressId
          const cart = await Cart.find({userId:userId})
          const address = await Address.findOne({_id:addressId})

         // This will print the current timestamp in ISO 8601 format
          
          const order = new Order({
            userId: userId,
            products: cart.map((cartItem) => ({
                productId: cartItem.productId,
                size: cartItem.size,
                quantity: cartItem.quantity,
                total: cartItem.total
            })),
            totalPrice:totalPrice,
            wcTotal:total,
            addressId: addressId,
            payment: req.body.paymentId,
            
        });
        console.log("order",order.orderedDate);
        const orderData = await order.save();
        return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });

      }
      else{
        const couponData = await Coupon.findByIdAndUpdate(couponId,
            { $addToSet: { users: { userId: userId } } }
        )
        
        const addressId = req.body.addressId
        const cart = await Cart.find({userId:userId})
        const address = await Address.findOne({_id:addressId})
        const coupon = await Coupon.findById(couponId);
        // let couponID = new mongoose.Types.ObjectId(couponId)
        // console.log(typeof couponID);
        // Create order with coupon
        
         // This will print the current timestamp in ISO 8601 format

        
            const order = new Order({
            userId: userId,
            products: cart.map((cartItem) => ({
                productId: cartItem.productId,
                size: cartItem.size,
                quantity: cartItem.quantity,
                total: cartItem.total
            })),
            totalPrice:totalPrice,
            discountTotal: total,
            couponId:couponId,
            addressId: addressId,
            payment: req.body.paymentId,
            
        });
       
        console.log("order",order.orderedDate);
        const orderData = await order.save();
        
        return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
      }
  }
 } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

const onlineOrder = async (req,res)=>{
  try {
     
    const amount = req.body.total*100
    
    const options = {
        amount:amount,
        currency :"INR",
        receipt:req.id
    }
    
    razorpayInstance.orders.create(options, function(err,order){
           
            if(!err){
              
                res.status(200).json({order})
                // res.status(200).send({
                //     success:true,
                //     msg:"order Created",
                //     order_id:order.id,
                //     amount:amount,
                //     key_id:RAZORPAY_ID_KEY,
                //     product_name:"req.body.name",
                //     contact:"9755512334",
                //     name:"shand",
                //     email:"nijasbinabbas@gmail.com",

                // })
             }
             else{
                
                res.status(400).send({success:false,msg:"something went wrong"})
             }
        })
     
  } catch (error) {
    console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
  }

    

}

const walletPayment = async (req,res)=>{
    try {
        const userId = req.id;
        const couponId = req.session.couponId
        const totalPrice = req.body.totalPrice 
        
        let total = req.body.total;
        total = parseInt(total)
       
        
        
        let wallets = await Wallet.findOne({userId:userId})
        if(wallets){
            let walletId = wallets._id
           
            let creditedAmount = 0
            let debitedAmount = 0
            
            wallets.details.forEach((wallet)=>{
               if(wallet.transactionType == "Credited"){
                creditedAmount += wallet.amount 
               }
               else{
                 debitedAmount += wallet.amount
               }
     
            })
            let totalAmount = creditedAmount - debitedAmount     
            
            
            if(total>totalAmount){
             res.status(200).json({success:true,message:'Wallet has insufficient balance'})
            }
            else{
    
                let updatedAmount = total
                const wallet = await Wallet.findByIdAndUpdate(
                    walletId,
                    {
                        $push: {
                            details: {
                                amount: updatedAmount,
                                transactionType: "Debited",
                                method: "purchased",
                                date: Date.now()
                            }
                        }
                    },
                    { new: true } // To return the updated document
                );
        
                if (req.body.addressId === null) {
          
                  
                    // Create new address
                    const address = new Address({
                        userId: userId,
                        name: req.body.name,
                        houseName: req.body.houseName,
                        state: "kerala",
                        pin: req.body.pin,
                        mobile: req.body.phoneNo
                    });
                    await address.save();
          
                    // Retrieve order address
                    let orderAddress = await Address.find({
                        name: req.body.name,
                        houseName: req.body.houseName,
                        pin: req.body.pin
                    });
          
                    // Retrieve cart items
                    const cart = await Cart.find({ userId: userId });
          
                    // Check if coupon is applied
                    if (couponId === null) {
                        // Create order without coupon
                        
                       
                        const order = new Order({
                            userId: userId,
                            products: cart.map((cartItem) => ({
                                productId: cartItem.productId,
                                size: cartItem.size,
                                quantity: cartItem.quantity,
                                total: cartItem.total
          
                            })),
                            totalPrice:totalPrice,
                            wcTotal:total,
                            addressId: orderAddress[0]._id,
                            payment: req.body.paymentId,
                            
                        });
                        const orderData = await order.save();
                        return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
                    } else {
                        // Fetch coupon details
                        
                       
                        const couponData = await Coupon.findByIdAndUpdate(couponId,
                          { $addToSet: { users: { userId: userId } } }
                      )
                        const coupon = await Coupon.findById(couponId);
                        // Create order with coupon
                        const order = new Order({
                            userId: userId,
                            products: cart.map((cartItem) => ({
                                productId: cartItem.productId,
                                size: cartItem.size,
                                quantity: cartItem.quantity,
                                total: cartItem.total
                            })),
                            totalPrice:totalPrice,
                            discountTotal: total,
                            couponId:couponId,
                            addressId: orderAddress[0]._id,
                            payment: req.body.paymentId,
                            
                        });
                        
                        
                        const orderData = await order.save();
                        return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
                    }
                } else {
          
          
                  
                  if(couponId == null){
                   
                    
                    const addressId = req.body.addressId
                    const cart = await Cart.find({userId:userId})
                    const address = await Address.findOne({_id:addressId})
                    
                    const order = new Order({
                      userId: userId,
                      products: cart.map((cartItem) => ({
                          productId: cartItem.productId,
                          size: cartItem.size,
                          quantity: cartItem.quantity,
                          total: cartItem.total
                      })),
                      totalPrice:totalPrice,
                      wcTotal:total,
                      addressId: addressId,
                      payment: req.body.paymentId,
                      
                  });
                  const orderData = await order.save();
                  return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
          
                }
                else{
                  const couponData = await Coupon.findByIdAndUpdate(couponId,
                      { $addToSet: { users: { userId: userId } } }
                  )
                  
                  const addressId = req.body.addressId
                  const cart = await Cart.find({userId:userId})
                  const address = await Address.findOne({_id:addressId})
                  const coupon = await Coupon.findById(couponId);
                  // let couponID = new mongoose.Types.ObjectId(couponId)
                  // console.log(typeof couponID);
                  // Create order with coupon
                  
                      const order = new Order({
                      userId: userId,
                      products: cart.map((cartItem) => ({
                          productId: cartItem.productId,
                          size: cartItem.size,
                          quantity: cartItem.quantity,
                          total: cartItem.total
                      })),
                      totalPrice:totalPrice,
                      discountTotal: total,
                      couponId:couponId,
                      addressId: addressId,
                      payment: req.body.paymentId,
                      
                  });
                  
                  
                  const orderData = await order.save();
                  
                  return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
                }
            }
            }
            
        }
        else{
            res.status(200).json({success:true,message:'Wallet has insufficient balance'})
        }
        
        
   
   } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
    
}

const onlineSuccess = async (req,res)=>{
    try {
       
        const userId = req.id;
        const couponId = req.session.couponId
        
        let total = req.body.total;
        
        let totalPrice = req.body.totalPrice
       


        
            
        // Check if address ID is provided
        if (req.body.addressId === null) {
  
          
            // Create new address
            const address = new Address({
                userId: userId,
                name: req.body.name,
                houseName: req.body.houseName,
                state: "kerala",
                pin: req.body.pin,
                mobile: req.body.phoneNo
            });
            await address.save();
  
            // Retrieve order address
            let orderAddress = await Address.find({
                name: req.body.name,
                houseName: req.body.houseName,
                pin: req.body.pin
            });
  
            // Retrieve cart items
         
            const cart = await Cart.find({ userId: userId });
  
            // Check if coupon is applied
            if (couponId === null) {
                // Create order without coupon
                
               
                const order = new Order({
                    userId: userId,
                    products: cart.map((cartItem) => ({
                        productId: cartItem.productId,
                        size: cartItem.size,
                        quantity: cartItem.quantity,
                        total: cartItem.total,
                        
                    })),
                    totalPrice:totalPrice,
                    wcTotal:total,
                    addressId: orderAddress[0]._id,
                    payment: req.body.paymentId,
                    
                    
                });
                const orderData = await order.save();
                return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
            } else {
                // Fetch coupon details
                
                
                const couponData = await Coupon.findByIdAndUpdate(couponId,
                    { $addToSet: { users: { userId: userId } } }
                )
               
                const coupon = await Coupon.findById(couponId);
                // Create order with coupon
                const order = new Order({
                    userId: userId,
                    products: cart.map((cartItem) => ({
                        productId: cartItem.productId,
                        size: cartItem.size,
                        quantity: cartItem.quantity,
                        total: cartItem.total,
                        
                    })),
                    totalPrice:totalPrice,
                    discountTotal: total,
                    couponId:couponId,
                    addressId: orderAddress[0]._id,
                    payment: req.body.paymentId,
                    
                });
                
                
                const orderData = await order.save();
                return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
            }
        } else {
  
  
          
          if(couponId == null){
           
            
            const addressId = req.body.addressId
            const cart = await Cart.find({userId:userId})
            const address = await Address.findOne({_id:addressId})
            
            const order = new Order({
              userId: userId,
              products: cart.map((cartItem) => ({
                  productId: cartItem.productId,
                  size: cartItem.size,
                  quantity: cartItem.quantity,
                  total: cartItem.total,
                  totalPrice:cartItem.totalPrice
              })),
              totalPrice:totalPrice,
              wcTotal:total,
              addressId: addressId,
              payment: req.body.paymentId,
              
          });
          const orderData = await order.save();
          return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
  
        }
        else{
          
          const couponData = await Coupon.findByIdAndUpdate(couponId,
            { $addToSet: { users: { userId: userId } } }
        )
          const addressId = req.body.addressId
          const cart = await Cart.find({userId:userId})
          const address = await Address.findOne({_id:addressId})
          const coupon = await Coupon.findById(couponId);
          
          // let couponID = new mongoose.Types.ObjectId(couponId)
          // console.log(typeof couponID);
          // Create order with coupon
          
              const order = new Order({
              userId: userId,
              products: cart.map((cartItem) => ({
                  productId: cartItem.productId,
                  size: cartItem.size,
                  quantity: cartItem.quantity,
                  total: cartItem.total,
                  totalPrice:cartItem.totalPrice
              })),
              totalPrice:totalPrice,
              discountTotal: total,
              couponId:couponId,
              addressId: addressId,
              payment: req.body.paymentId,
              
          });
          
          
          const orderData = await order.save();
          
          return res.status(200).json({ success: true, redirect: `/order-success?orderId=${orderData._id}` });
        }

    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}

const failureOrder = async (req,res)=>{
    try {
       
        const userId = req.id;
        const couponId = req.session.couponId
        
        let total = req.body.total;
        
        let totalPrice = req.body.totalPrice
            
        // Check if address ID is provided
        if (req.body.addressId === null) {
  
          
            // Create new address
            const address = new Address({
                userId: userId,
                name: req.body.name,
                houseName: req.body.houseName,
                state: "kerala",
                pin: req.body.pin,
                mobile: req.body.phoneNo
            });
            await address.save();
  
            // Retrieve order address
            let orderAddress = await Address.find({
                name: req.body.name,
                houseName: req.body.houseName,
                pin: req.body.pin
            });
  
            // Retrieve cart items
            const cart = await Cart.find({ userId: userId });
  
            // Check if coupon is applied
            if (couponId === null) {
                // Create order without coupon
                
               
                const order = new Order({
                    userId: userId,
                    products: cart.map((cartItem) => ({
                        productId: cartItem.productId,
                        size: cartItem.size,
                        quantity: cartItem.quantity,
                        total: cartItem.total,
                        
                    })),
                    totalPrice:totalPrice,
                    wcTotal:total,
                    addressId: orderAddress[0]._id,
                    payment: req.body.paymentId,
                    isPayment:false,
                    
                });
                const orderData = await order.save();
                return res.status(200).json({ success: true, redirect: `/order-unSuccess?orderId=${orderData._id}` });
            } else {
                // Fetch coupon details
                
               
                const couponData = await Coupon.findByIdAndUpdate(couponId,
                    { $addToSet: { users: { userId: userId } } }
                )
                const coupon = await Coupon.findById(couponId);
                // Create order with coupon
                const order = new Order({
                    userId: userId,
                    products: cart.map((cartItem) => ({
                        productId: cartItem.productId,
                        size: cartItem.size,
                        quantity: cartItem.quantity,
                        total: cartItem.total,
                        
                    })),
                    totalPrice:totalPrice,
                    discountTotal: total,
                    couponId:couponId,
                    addressId: orderAddress[0]._id,
                    payment: req.body.paymentId,
                    isPayment:false,
                    
                });
                
                
                const orderData = await order.save();
                return res.status(200).json({ success: true, redirect: `/order-unSuccess?orderId=${orderData._id}` });
            }
        } else {
  
  
          
          if(couponId == null){
           
            
            const addressId = req.body.addressId
            const cart = await Cart.find({userId:userId})
            const address = await Address.findOne({_id:addressId})
            
            const order = new Order({
              userId: userId,
              products: cart.map((cartItem) => ({
                  productId: cartItem.productId,
                  size: cartItem.size,
                  quantity: cartItem.quantity,
                  total: cartItem.total,
                  totalPrice:cartItem.totalPrice
              })),
              totalPrice:totalPrice,
              wcTotal:total,
              addressId: addressId,
              payment: req.body.paymentId,
              isPayment:false,
              
          });
          const orderData = await order.save();
         
          return res.status(200).json({ success: true, redirect: `/order-unSuccess?orderId=${orderData._id}` });
  
        }
        else{
          
          const couponData = await Coupon.findByIdAndUpdate(couponId,
            { $addToSet: { users: { userId: userId } } }
        )
          const addressId = req.body.addressId
          const cart = await Cart.find({userId:userId})
          const address = await Address.findOne({_id:addressId})
          const coupon = await Coupon.findById(couponId);
          
          // let couponID = new mongoose.Types.ObjectId(couponId)
          // console.log(typeof couponID);
          // Create order with coupon
          
              const order = new Order({
              userId: userId,
              products: cart.map((cartItem) => ({
                  productId: cartItem.productId,
                  size: cartItem.size,
                  quantity: cartItem.quantity,
                  total: cartItem.total,
                  totalPrice:cartItem.totalPrice
              })),
              totalPrice:totalPrice,
              discountTotal: total,
              couponId:couponId,
              addressId: addressId,
              payment: req.body.paymentId,
              isPayment:false,
              
          });
          
          
          const orderData = await order.save();
          
          return res.status(200).json({ success: true, redirect: `/order-unSuccess?orderId=${orderData._id}` });
        }

    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
    }
}


const viewOrder = async (req,res)=>{
  

   let userId = req.id
   const categories = await Category.find({delete: true})
   const orderId = req.query.id
  
   const order = await Order.findOne({_id:orderId}).populate("products.productId")
   let total = 0
   order.products.forEach((order)=>{
    total = total + order.total
   })
   

  
   if(order){
      res.render("orderDetails",{order:order,total:total,categories:categories})
   }
}

const cancelOrder = async (req,res)=>{

    try {
        console.log(req.body.reason);
        const userId = req.id
     const status = req.body.status
     if(req.body.reason== 'reason1'){
        reason = "Shoes has no expected size"
     }
     else if(req.body.reason == 'reason2'){
        reason = "shoe is damaged"
     }
    else {
        reason = "Quality is not good"
    }
    
     
     
     const orderId = req.body.orderId
     const orders = await Order.findByIdAndUpdate(orderId,{status:"cancelled",reason:reason})
     const orderOne = await Order.findByIdAndUpdate(orderId, {}, { new: true });
     console.log("orders",orderOne);
     await orderOne.populate('products.productId')
     orderOne.products.forEach(async(product)=>{
       
       console.log("productId",product.productId._id);
       const productId = product.productId._id
       const stock = product.productId.stock + product.quantity
        product.quantity = 0
       const products = await Product.findByIdAndUpdate(productId,{
           stock:stock
       })
     })
     
     
     
     
     console.log("ordesroNe",orderOne);
     const order = await Order.findOne({_id:orderId})
    
    
     let wallet 
     
     wallet = await Wallet.findOne({userId:userId})
    
     if(wallet){
        
     }
     else{
        const newWallet = new Wallet({
            userId: userId,
            details: [{
                amount: 0,
                
            }]
        });
        
        await newWallet.save();
        
     }

     
     if(orders.payment =="online-payment"){
        if(orders.wcTotal){
        
            const wallet = await Wallet.findOne({userId:userId})
          
            const wallets = await Wallet.findByIdAndUpdate(
                wallet._id,
                {
                    $push: {
                        details: {
                            amount: orders.wcTotal,
                            transactionType: "Credited",
                            method: "cancelled",
                            date: Date.now()
                        }
                    }
                },
                { new: true } // To return the updated document
            );
    
             res.status(200).json({status:"cancelled",message:1})
        }
        else{
          
            const wallet = await Wallet.findOne({userId:userId})
            const wallets = await Wallet.findByIdAndUpdate(
                wallet._id,
                {
                    $push: {
                        details: {
                            amount: orders.discountTotal,
                            transactionType: "Credited",
                            method: "cancelled",
                            date: Date.now()
                        }
                    }
                },
                { new: true } // To return the updated document
            );
             res.status(200).json({status:"cancelled",message:1})
        }
  
     }
     else if(orders.payment == "wallet-payment"){
        if(orders.wcTotal){
            
                const wallet = await Wallet.findOne({userId:userId})
    
                const wallets = await Wallet.findByIdAndUpdate(
                    wallet._id,
                    {
                        $push: {
                            details: {
                                amount: orders.wcTotal,
                                transactionType: "Credited",
                                method: "cancelled",
                                date: Date.now()
                            }
                        }
                    },
                    { new: true } // To return the updated document
                );
        
                 res.status(200).json({status:"cancelled",message:1})
            }
            else{
                console.log("hai");
                const wallet = await Wallet.findOne({userId:userId})
                const wallets = await Wallet.findByIdAndUpdate(
                    wallet._id,
                    {
                        $push: {
                            details: {
                                amount: orders.discountTotal,
                                transactionType: "Credited",
                                method: "cancelled",
                                date: Date.now()
                            }
                        }
                    },
                    { new: true } // To return the updated document
                );
                 res.status(200).json({status:"cancelled",message:1})
            }
     }
     else{
        
        res.status(200).json({status:"cancelled"})
     } 
    } catch (error) {
        console.log(error);
        const errorMessage = "Internal Server Error";
        return res.status(500).render("errorPage", { statusCode: 500, errorMessage }) 
    }
    
          
     
}

const returnOrder = async (req,res)=>{
 try {
    const userId = req.id
    const status = req.body.status
    
    if(req.body.reason== 'reason1'){
        reason = "Shoes has no expected size"
     }
     else if(req.body.reason == 'reason2'){
        reason = "shoe is damaged"
     }
    else {
        reason = "Quality is not good"
    }

    
    const orderId = req.body.orderId
    const orders = await Order.findByIdAndUpdate(orderId,{status:"returned",reason:reason})
    await orders.save()

    const order = await Order.findOne({_id:orderId})
   
    
    if(orders){
       if(orders.wcTotal){
        const wallet = await Wallet.findOne({userId:userId})
        const wallets = await Wallet.findByIdAndUpdate(
            wallet._id,
            {
                $push: {
                    details: {
                        amount: orders.wcTotal,
                        transactionType: "Credited",
                        method: "returned",
                        date: Date.now()
                    }
                }
            },
            { new: true } // To return the updated document
        );
            res.status(200).json({status:"returned",message:"Your order is returned and amount has been credited into wallet"})
       }
       else{
        const wallet = await Wallet.findOne({userId:userId})
        const wallets = await Wallet.findByIdAndUpdate(
            wallet._id,
            {
                $push: {
                    details: {
                        amount: orders.discountTotal,
                        transactionType: "Credited",
                        method: "returned",
                        date: Date.now()
                    }
                }
            },
            { new: true } // To return the updated document
        );
            res.status(200).json({status:"returned",message:"Your order is returned and amount has been credited into wallet"})
       }
 
    }
 } catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
 }
}

const daySales = async (req,res)=>{
  try {
      console.log(req.body);
    const date = req.body.selectedOption
    const startDate = req.body.startDate
    const endDate = req.body.endDate
 

    if(date == "month"){
        const currentDate = moment()
    
        const startOfMonth = currentDate.clone().startOf('month').date(1)
    
        const endOfMonth = currentDate.clone().endOf('month')
    
        const startOfMonthFormatted = startOfMonth.format('YYYY-MM-DD');
        const endOfMonthFormatted = endOfMonth.format('YYYY-MM-DD');
    
        
    
      const orders = await Order.find({orderedDate:{
        $gte: startOfMonthFormatted, // Greater than or equal to the start date
        $lte: endOfMonthFormatted},status:"delivered"
      })
      let orderOriginalPrice = 0
      let orderDiscountPrice = 0
      orders.forEach((order)=>{
         orderOriginalPrice+= parseInt(order.totalPrice) 
         if(order.discountTotal){
            orderDiscountPrice += parseInt(order.discountTotal)
         }
        else{
            orderDiscountPrice += parseInt(order.wcTotal)
        }
    
         
      })
    
      totalDiscount = orderOriginalPrice - orderDiscountPrice
    
    
      
     res.render('salesReport',{orders:orders,orderOriginalPrice:orderOriginalPrice,orderDiscountPrice:orderDiscountPrice,totalDiscount:totalDiscount}) 
    }
    
   
    if(date =="day"){

        const currentDate = moment();
        const startOfDay = currentDate.clone().startOf('day');
        const endOfDay = currentDate.clone().endOf('day');
        
        const startOfDayFormatted = startOfDay.toDate();
        const endOfDayFormatted = endOfDay.toDate();
        
       
        
        const orders = await Order.find({
          orderedDate: {
            $gte: startOfDayFormatted, // Greater than or equal to the start of the day
            $lt: endOfDayFormatted     // Less than the end of the day
          },status:"delivered"
        });
        
      let orderOriginalPrice = 0
      let orderDiscountPrice = 0
      orders.forEach((order)=>{
         orderOriginalPrice+= parseInt(order.totalPrice) 
         if(order.discountTotal){
            orderDiscountPrice += parseInt(order.discountTotal)
         }
        else{
            orderDiscountPrice += parseInt(order.wcTotal)
        }
    
         
      })
     
      totalDiscount = orderOriginalPrice - orderDiscountPrice
    
    
     
     res.render('salesReport',{orders:orders,orderOriginalPrice:orderOriginalPrice,orderDiscountPrice:orderDiscountPrice,totalDiscount:totalDiscount})
    }

    if(date =="weak"){
        const currentDate = moment()
        const startOfWeek = currentDate.clone().startOf('week');
     
        const endOfWeek = currentDate.clone().endOf('week');
        
        const startOfWeekFormatted = startOfWeek.format('YYYY-MM-DD');
        const endOfWeekFormatted = endOfWeek.format('YYYY-MM-DD');
        
       
        
        const orders = await Order.find({
          orderedDate: {
            $gte: startOfWeekFormatted, // Greater than or equal to the start date of the week
            $lte: endOfWeekFormatted    // Less than or equal to the end date of the week
          },status:"delivered"
        });
    
       
      let orderOriginalPrice = 0
      let orderDiscountPrice = 0
      orders.forEach((order)=>{
         orderOriginalPrice+= parseInt(order.totalPrice) 
         if(order.discountTotal){
            orderDiscountPrice += parseInt(order.discountTotal)
         }
        else{
            orderDiscountPrice += parseInt(order.wcTotal)
        }
    
         
      })
      
      totalDiscount = orderOriginalPrice - orderDiscountPrice
    
    
      console.log("total",totalDiscount);
     res.render('salesReport',{orders:orders,orderOriginalPrice:orderOriginalPrice,orderDiscountPrice:orderDiscountPrice,totalDiscount:totalDiscount})
    }
  

       if(date == "year"){
       const currentDate = moment(); // Get the current date
        const startOfYear = currentDate.clone().startOf('year'); // Get the start of the current year
        const endOfYear = currentDate.clone().endOf('year'); // Get the end of the current year

        const startOfYearFormatted = startOfYear.format('YYYY-MM-DD'); // Format start of year
        const endOfYearFormatted = endOfYear.format('YYYY-MM-DD'); // Format end of year

      
        const orders = await Order.find({
        orderedDate: {
            $gte: startOfYearFormatted, // Greater than or equal to the start date of the year
            $lte: endOfYearFormatted    // Less than or equal to the end date of the year
        },status:"delivered"
        });
        
        
        let orderOriginalPrice = 0
        let orderDiscountPrice = 0
        orders.forEach((order)=>{
        orderOriginalPrice+= parseInt(order.totalPrice) 
        if(order.discountTotal){
            orderDiscountPrice += parseInt(order.discountTotal)
        }
        else{
            orderDiscountPrice += parseInt(order.wcTotal)
        }

            })

            
            res.render('salesReport',{orders:orders,orderOriginalPrice:orderOriginalPrice,orderDiscountPrice:orderDiscountPrice,totalDiscount:totalDiscount})
        }

    if(startDate !==""){

         const startdate = startDate
         const enddate = endDate
        
         
         const orders = await Order.find({
            orderedDate: {
                $gte: startdate, // Greater than or equal to the start date of the year
                $lte: enddate    // Less than or equal to the end date of the year
            },status:"delivered"
            });
            
            let orderOriginalPrice = 0
        let orderDiscountPrice = 0
        orders.forEach((order)=>{
        orderOriginalPrice+= parseInt(order.totalPrice) 
        if(order.discountTotal){
            orderDiscountPrice += parseInt(order.discountTotal)
        }
        else{
            orderDiscountPrice += parseInt(order.wcTotal)
        }

            })

            
            res.render('salesReport',{orders:orders,orderOriginalPrice:orderOriginalPrice,orderDiscountPrice:orderDiscountPrice,totalDiscount:totalDiscount})
    }

}
   catch (error) {
    console.log(error);
    const errorMessage = "Internal Server Error";
    return res.status(500).render("errorPage", { statusCode: 500, errorMessage })
  }
}



module.exports = {
    
    insertOrder,
    loadSuccess,
    viewOrder,
    cancelOrder,
    returnOrder,
    onlineOrder,
    failureOrder,
    walletPayment,
    onlineSuccess,
    loadUnSuccess,
    daySales
  }