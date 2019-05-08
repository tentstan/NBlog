const path = require('path')
const assert = require('assert')
const request = require('supertest')
const app = require('../index')
const User = require('../lib/mongo').User

const testName1 = 'testName1'
const testName2 = 'testName2'

describe('signup',function (){
    describe('POST /signup',function (){
        const agent = request.agent(app)
        beforeEach(function (done){
            User.create({
                name:testName1,
                password:'123456',
                avatar:'',
                gender:'x',
                bio:''
            })
                .exec()
                .then(function (){
                    done()
                })
                .catch(done)
        })

        afterEach(function (done){
            User.deleteMany({name:{$in:[testName1,testName2]}})
                .exec()
                .then(function (){
                    done()
                })
                .catch(done)
        })

        after(function (done){
            process.exit()
        })

        it('wrong name',function (done){
            agent 
                .post('/signup')
                .type('form')
                .field({name:''})
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .redirects()
                .end(function (err,res){
                    if(err){
                        return done(err)
                    }
                    assert(res.text.match(/name length limit 1-10 character/))
                    done()
                })
        })

        it('wrong gender',function (done){
            agent 
                .post('/signup')
                .type('form')
                .field({name:testName2,gender:'a'})
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .redirects()
                .end(function (err,res){
                    if(err) {
                        return done(err)
                    }
                    assert(res.text.match(/gender can be one of m,f,x/))
                    done()
                })
        })

        it('duplicate name',function (done){
            agent 
                .post('/signup')
                .type('form')
                .field({name:testName1,gender:'m',bio:'noder',password:'123456',repassword:'123456'})
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .redirects()
                .end(function (err,res){
                    if(err) {
                        return done(err)
                    }
                    assert(res.text.match(/user name has been used/))
                    done()
                })
        })

        it('success',function (done){
            agent
                .post('/signup')
                .type('form')
                .field({name:textName2,gender:'m',bio:'noder',password:'123456',repassword:'123456'})
                .attach('avatar',path.join(__dirname,'avatar.png'))
                .redirects()
                .end(function (err,res){
                    if(err) {
                        return done(err)
                    }
                    assert(res.text.match(/Success to SignUp/))
                    done()
                })
        })
    })
})
