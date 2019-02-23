const express= require('express')
const router = express.Router()
const { authenticateUser } = require('../middleware/authenticateUser')

const { User } = require('../models/user')

router.get('/',(req,res)=>{
    User.find()
    .then((users)=>{
        res.send(users)
    }).catch((err)=>{
        res.send(err)
    })
})

//post localhost:3000/users/register

router.post('/register',(req,res)=>{
    const body = req.body
    console.log(body)
    const user = new User(body)
    console.log(user)
    
    //instance methods are called on objects

    user.save()  //server side validations
    .then((user)=>{ //if validations passed
        console.log(user)
        res.send({
        user:user, //concise property
        notice:'successfully registered'
    })
    })
    .catch((err)=>{ //if server side validations failed
        console.log(err)
        res.send(err)
    })
})
//post localhost:3000/users/login
//login is post because via html form . via Post  request are NOT made available in url
//if we use get, data needs to be sent in URL - 'login?email=3@gmail.com&password=secret123'/data cannot be sent in req body - this is unsafe
router.post('/login',(req,res)=>{
    const body = req.body
    //static method is called on models/class
    User.findByEmailAndPassword(body.email,body.password)
    .then((user)=>{
        
        //res.send(user) - now we will generate token, so commenting this

        // user.generateToken() //instance method since user is object
        // .then((token)=>{

        // }).catch((err)=>{

        // }) - Promise generateToken is inside PRomise findByEmailAndPassword - not recommended/Promise chain

        //so use below

        return user.generateToken()
    })
    .then((token)=>{
       // res.send(token)
       //comenting above bcoz we want token to send in req header instead req body
       // res.header('x-autho',token).send() // because of react, we cant send in req header thru axios, postman can read from header

       res.send({token})
    })
    .catch((err)=>{ //single catch
        //res.send(err)
        res.status('404').send(err)
    })
})

//delete localhost:3000/users/logout

router.delete('/logout',authenticateUser,(req,res)=>{
    //
    const token = req.token
    console.log(token)
    const user = req.user

    user.deleteToken(token).then(()=>{
        res.send('successfully logged out')
    })
    .catch((err)=>{
        res.send(err)
    })
})

router.delete('/logoutfromall',authenticateUser,(req,res)=>{
    //
    const token = req.token
    console.log(token)
    const user = req.user

    user.deleteAllTokens().then(()=>{
        res.send('successfully logged out from all devices')
    })
    .catch((err)=>{
        res.send(err)
    })
})

module.exports = {
    usersRouter:router
}