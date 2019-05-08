const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')
const express = require('express')
const router = express.Router()

const UserModel = require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin

router.get('/',checkNotLogin,function (req,res,next){
    res.render('signup')
})

router.post('/',checkNotLogin,function (req,res,next){
    const name = req.fields.name 
    const gender = req.fields.gender
    const bio = req.fields.bio
    const avatar = req.files.avatar.path.split(path.sep).pop()
    let password = req.fields.password
    const repassword = req.fields.repassword

    try{
        if(!(name.length >= 1 && name.length <= 10)){
            throw new Error('name can be within 1-10 characters')
        }

        if(['m','f','x'].indexOf(gender) === -1){
            throw new Error('gender can only be one of m,f,x')
        }

        if(!(bio.length >= 1 && bio.length <= 30)){
            throw new Error('bio is limit within 1-30 characters')
        }

        if(!req.files.avatar.name){
            throw new Error('lack of avatar')
        }

        if(password.length < 6){
            throw new Error('password can not less than 6 characters')
        }

        if(password !== repassword){
            throw new Error('two input password not the same')
        }
    }catch (e){
        fs.unlink(req.files.avatar.path)
        req.flash('error',e.message)
        return res.redirect('/signup')
    }

    password = sha1(password)

    let user = {
        name:name,
        password : password,
        gender:gender,
        bio:bio,
        avatar:avatar 
    }

    UserModel.create(user)
        .then(function (result){
            user = result.ops[0]
            delete user.password
            req.session.user = user 
            req.flash('Success','Success to SignUp')
            res.redirect('/posts')
        })
        .catch(function (e){
            fs.unlink(req.files.avatar.path)
            if(e.message.match('duplicate key')){
                req.flash('error','user name has been taken')
                return res.redirect('/signup')
            }
            next(e)
        })
})

module.exports = router 
