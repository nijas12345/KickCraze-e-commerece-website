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


module.exports = {requireAuth,requireAuth1}