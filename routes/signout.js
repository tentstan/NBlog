const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin

router.get('/',checkLogin,function(req,res,next){
    req.session.user = null 
    req.flash('Success','Success to Logout')
    res.redirect('/posts')
})

module.exports = router 
