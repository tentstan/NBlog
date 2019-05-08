const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const CommentModel = require('../models/comments')

router.post('/',checkLogin,function (req,res,next){
    const author = req.session.user._id
    const postId = req.fields.postId
    const content = req.fields.content 

    try {
        if(!content.length) {
            throw new Error('Please Input Post Message!')
        }
    }catch (e){
        req.flash('error',e.message)
        return res.redirect('back')
    }

    const comment = {
        author:author,
        postId:postId,
        content:content 
    }

    CommentModel.create(comment)
        .then(function(){
            req.flash('Success!','Success to Post Comment.')
            res.redirect('back')
        })
        .catch(next)
})


router.get('/:commentId/remove',checkLogin,function(req,res,next){
    const commentId = req.params.commentId
    const author = req.session.user._id

    CommentModel.getCommentById(commentId)
        .then(function (comment) {
            if (!comment) {
                throw new Error('Comment not exsit.commentId:%s,auhtor:%s',commentId,author.toString())
            }

            if(comment.author.toString() !== author.toString()){
                throw new Error('You have no right to delelte this comment,commentId:%s,author:%s',commentId,author.toString())
            }

            CommentModel.delCommentById(commentId)
                .then(function(){
                    req.flash('Success','Sucess to Delete comment')
                    res.redirect('back')
                })
                .catch(next)
        })
})

module.exports = router 
