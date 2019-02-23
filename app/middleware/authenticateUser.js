const express = require('express')
// const router = express.Router() 
// const jwt = require('jsonwebtoken')
// const { Contact } = require('../models/contact')
const { User } = require('../models/user')


function authenticateUser (req,res,next){
    const token = req.header('x-autho')
    console.log(token)
    if (token)
    {
     User.findByToken(token)
    .then((user)=>{
        req.user=user //attaching user object to req
        req.token=token //attaching token to req object
        next()
    }).catch((err)=>{
        res.send(err)
    })
    }else{
        res.send('token not provided errors')
    }
    
}

module.exports ={
    authenticateUser
}