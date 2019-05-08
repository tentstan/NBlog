const express = require('express')
const router = express.Router()

const checkLogin = require('../middlewares/check').checkLogin
const PostModel = require('../models/posts')
const CommentModel = require('../models/comments')

router.get('/',function (req,res,next){
    const author = req.query.author

    PostModel.getPosts(author)
        .then(function (posts){
            res.render('posts',{
                posts:posts 
            })
        })
        .catch(next)
})

router.post('/create',checkLogin,function(req,res,next){
    const author = req.session.user._id
    const title = req.fields.title 
    const content = req.fields.content 

    try{
        if(!title.length){
            throw new Error('Please Input the Title')
        }

        if(!content.length){
            throw new Error('Please Input the Content')
        }
    }catch (e){
        req.flash('error',e.message)
        return res.redirect('back')
    }

    let post = {
        author:author,
        title:title,
        content:content 
    }

    PostModel.create(post)
        .then(function (result) {
            post = result.ops[0]
            req.flash('Success','Success to Post')
            res.redirect(`/posts/${post._id}`)
        })
        .catch(next)
})

router.get('/create',checkLogin,function(req,res,next){
    res.render('create')
})

router.get('/:postId',function (req,res,next){
    const postId = req.params.postId

    Promise.all([
        PostModel.getPostById(postId),
        CommentModel.getComments(postId),
        PostModel.incPv(postId)
    ])
        .then(function (result){
            const post = result[0]
            const comments = result[1]

            if(!post) {
                throw new Error('this post is not exsit,postId:%s',postId)
            }

            res.render('post',{
                post:post,
                comments:comments  
            })
        })
        .catch(next)
})


router.get('/:postId/edit',checkLogin,function (req,res,next){
    const postId = req.params.postId
    const author = req.session.user._id

    PostModel.getRawPostById(postId)
        .then(function (post){
            if(!post) {
                throw new Error('the post is not exsit,postId:%s,author:%s',postId,author)
            }

            if(author.toString() !== post.author._id.toString()){
                throw new Error('Permission denied,postId:%s,author:%s',postId,author)
            }

            res.render('edit',{
                post:post 
            })
        })
        .catch(next)
})

router.post('/:postId/edit',checkLogin,function(req,res,next){
    const postId = req.params.postId
    const author = req.session.user._id
    const title = req.fields.title 
    const content = req.fields.content 

    try {
        if(!title.length){
            throw new Error('Please Input Title')
        }

        if(!content.length){
            throw new Error('Please Input Content')
        }
    } catch (e){
        req.flash('error',e.message)
        return res.redirect('back')
    }

    PostModel.getRawPostById(postId)
        .then(function (post){
            if(!post){
                throw new Error('post not exit,postId:%s,author:%s',postId,author)
            }

            if(post.author._id.toString() !== author.toString()){
                throw new Error('Permission Denied,postId:%s,author:%s',postId,author)
            }

            PostModel.updatePostById(postId,{title:title,content:content})
                .then(function(){
                    req.flash('Success','Success to Edit post')
                    res.redirect(`/posts/${postId}`)
                })
                .catch(next)
        })
})


router.get('/:postId/remove',checkLogin,function (req,res,next){
    const postId = req.params.postId
    const author = req.session.user._id

    PostModel.getRawPostById(postId)
        .then(function (post){
            if(!post){
                throw new Error('post not exsit,postId:%s,author:%s',postId,author)
            }

            if(post.author._id.toString() !== author.toString()){
                throw new Error('Permission Denied')
            }

            PostModel.delPostById(postId)
                .then(function(){
                    req.flash('Success','Success to delete post')
                    res.redirect('/posts')
                })
                .catch(next)
        })
})

module.exports = router 
