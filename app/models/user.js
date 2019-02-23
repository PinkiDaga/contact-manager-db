//skinny controller, fat models

const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { Schema } = mongoose

const userSchema = new Schema ({
    username:{
        type:String,
        required:true
      //  minlength:5
    },
    email:{
        type: String,
        required:true,
        unique:true, //property
        validate:{
            validator: function(value){
                return validator.isEmail(value)
            },
            message: function(){
                return 'invalid email format'
            }
                }
    },
    password:{
        type:String,
        required:true,
        minlength:8,
        maxlength:128
    },
    createdAt:{
        type:Date,
        default: Date.now
    },
    tokens:[
        {
            token:{
                 type:String,
                 //loginType like desktop etc
               }
        }
      ]
})

userSchema.pre('save', function (next) {
    if (this.isNew){ //first time when user registers then isNew is true

        bcryptjs.genSalt(10)
        .then((salt)=>{  
            bcryptjs.hash(this.password,salt)  //this user object
            .then((hashedPassword)=>{
                this.password = hashedPassword
                next() //calling next means we gong from presave to userSchema.save()
            })
            .catch((err)=>{

            })    
        })
    }else{
        console.log('isNew=false')
        next()
    }
    
})

//static methods are defined at Schema level

userSchema.statics.findByEmailAndPassword = function(email,password){
    const User = this // we are referiing to 'User' model from users_controller
    //we cant do find-find returns array of object/findOne returns Object
    return User.findOne({email:email})
    .then((user)=>{
        if (user){ //if email exists
            return bcryptjs.compare(password,user.password).then((result)=>{
                if(result){ //password match
                    return new Promise ((resolve,reject)=>{
                        resolve(user)
                    })

                    //OR there is a shorthand
                   // return Promise.resolve(user)
                }else{ //password doesnot match,reject the Promise
                    return new Promise ((resolve,reject)=>{
                      //  reject('invalid password')
                      reject ('invalid email or password')
                    })

                    //OR 
                    //return Promise.reject('invalid email or password')
                }
            })
        }else{  //if blank/null email retured from find,Promise still resolved,so we explicitly rejecting it
            return new Promise ((resolve,reject)=>{
                //reject ('invalid email id')
                reject ('invalid email or password')
            })
        }
    }) //res.send at express level so from model we can only send Promises
    .catch((err)=>{
        return new Promise((resolve,reject)=>{
            reject(err)
        })
    })
}

userSchema.statics.findByToken = function(token){
    const User = this
    let tokenData
    try{
        //decode the token
        tokenData = jwt.verify(token,'dct@welt123')
    }catch(err){
       // res.send(err) because we r in model
       return Promise.reject(err)
    }
    console.log(tokenData) // decoded toekn-contains {userid}
    return User.findOne({
        _id:tokenData.userId,
        'tokens.token':token //under tokens array we have token object
    })
    .then((user)=>{
        //next() //next method is called
        return Promise.resolve(user)
    })
    .catch((err)=>{
        //res.send(err)
        return Promise.reject(err)
    })

}
userSchema.methods.generateToken = function(){
    const user = this //this refers to usr object -instance method
    const tokenData = {
        userId : user._id
        //role
    }

    const token = jwt.sign(tokenData,'dct@welt123')
    user.tokens.push({
        token:token
    })

    return user.save().then((user)=>{ //etting user object but returning token from promise
        return token
    }).catch((err)=>{
        return err
    })
}
//logout from one
userSchema.methods.deleteToken = function(t){
    const user = this

    // for (var i=0;i<user.tokens.length;i++){
    //     if (t == user.tokens[i].token){
    //         user.tokens.splice(i,1)
    //     }
    // }
    const myToken = user.tokens.filter(function(x){
        user.tokens.token!=t
    })

    user.tokens = myToken

    // user.tokens = user.tokens(token => token.token != token )

    return user.save()
}

userSchema.methods.deleteAllTokens = function(){
    const user = this
        user.tokens = []
    
    return user.save()
}

const User = mongoose.model('User', userSchema)

module.exports = {
    User
}