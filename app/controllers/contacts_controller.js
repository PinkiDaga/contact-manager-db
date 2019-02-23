const express = require('express')
const router = express.Router() 
const jwt = require('jsonwebtoken')
const { Contact } = require('../models/contact')
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
// route - fetch all contacts from db and send it to client 
router.get('/', authenticateUser,(req, res) => {
    // Contact.find()
        Contact.find({
            user:req.user._id
        })
        .then((contacts) => {
            res.send(contacts)
        })
        .catch((err) => {
            res.send(err)
        })
})

// route - to create a contact 
router.post('/', authenticateUser,(req, res) => {
    const body = req.body
    const contact = new Contact(body)
    contact.user = req.user._id //before saving attach the user id
    contact.save()
        .then((contact) => {
            res.send(contact)
        })
        .catch((err) => {
            res.send(err)
        })
})

// route - to get a contact 
router.get('/:id', authenticateUser,(req, res) => {
    const id = req.params.id
    console.log(id)
    console.log(req.user._id)
    // Contact.findById(id)
    Contact.findOne({
        _id:id,
        user:req.user._id   
    })
        .then((contact) => {
            if (contact) { // if the contact is present
                res.send(contact)
            } else { // if contact not present then value is null
                res.send({})
            }
        })
        .catch((err) => {
            res.send(err)
        })
})

// route - to delete a contact
router.delete('/:id', authenticateUser,(req, res) => {
    const id = req.params.id
    // Contact.findByIdAndDelete(id)
    Contact.findOneAndDelete({
        _id:id,
        user:req.user._id
    })
        .then((contact) => {
            if (contact) {
                res.send(contact)
            } else {
                res.send({})
            }
        })
        .catch((err) => {
            res.send(err)
        })
})

//route - to edit a contact
router.put('/:id',authenticateUser,(req,res)=>{
    console.log('put')
    const id = req.params.id
    const body=req.body
    console.log('id',id)
    console.log('user',req.user._id)
    console.log('body',body)
    //to check the login user is same as user who requesting the operation
    Contact.findOneAndUpdate({
        _id:id,user:req.user._id},{$set: body},{new:true}) ////new: to send me updated data
    .then((contact)=>{
        console.log('success')
        res.send(contact)
    })
    .catch((err)=>{
        console.log(err)
        res.send(err)
    })
})
module.exports = {
    contactsRouter: router
}