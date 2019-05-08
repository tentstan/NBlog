module.exports = {
    checkLogin:function checkLogin(req,res,next){
        if(!req.session.user){
            req.flash('error','user have not login')
            return res.redirect('/signin')
        }
        next()
    },

    checkNotLogin:function checkNotLogin (req,res,next){
        if(req.session.user){
            req.flash('error','user have login')
            return res.redirect('back')
        }
        next()
    }
}
