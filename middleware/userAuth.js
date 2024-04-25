const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
require("dotenv").config();
const secret = process.env.JWT_SECRET
const requireAuth = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        console.log(token)
        if(token){
            jwt.verify(token,secret,(err,decodedToken)=>{
                if(err){
                    console.log(err)    
                    res.redirect("/login")
                }
                else{
                    console.log(decodedToken);
                   req.id=decodedToken.id
                    next()
                }
            })
            
        }
        else{
            res.redirect('/login')
        }
    } catch (error) {
        
    }
 
}   
const requireAuth1 = async (req,res,next)=>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token,secret,async(err,decodedToken)=>{
            if(err){
                
                next()
            }
            else{
                res.redirect('/home')
            }
        })
    }
    else{
        next()
    }
}

const isBlocked = async (req,res,next)=>{
    const userId = req.id
    const user = await User.findOne({_id:userId})
    console.log("user",user);
    console.log(user.status);
    if(user.status == false){
       await res.cookie("jwt","",{maxAge:1})
       res.redirect('/login')
    }
    else{
        next()
    }
}

const jwtVerify = async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        console.log(token)
        if(token){
            jwt.verify(token,secret,(err,decodedToken)=>{
                if(err){
                    console.log(err)    
                    res.redirect("/login")
                }
                else{
                    console.log(decodedToken);
                   req.id=decodedToken.id
                    next()
                }
            })
            
        }
        else{
           next()
        }
    } catch (error) {
        
    }
 
} 

module.exports = {requireAuth,requireAuth1,isBlocked,jwtVerify}