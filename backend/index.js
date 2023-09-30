const express = require('express')//package import
const app = express()
require('./db/config')
const User = require('./db/User')
const Product = require('./db/Product')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const jwtKey = 'e-comm'

//express middleware(client/postman/react se joh json data send krtey  hai usko handle/catch krta hai api ke andar)
app.use(express.json())
app.use(cors())
//api routing...api link ko hit krne ka bad uska api data consume hoga
//create API
app.post('/register', async (req, res) => {
    // console.log(req.body)//req send from client
    // res.send(req.body)
    let user = new User(req.body)
    let result = await user.save()//save method return promise
    console.log(result);
    result = result.toObject()
    delete result.password
    // res.send(result)
    jwt.sign({result},jwtKey,{expiresIn:"2h"},(err,token)=>{
        if(err) {
            res.send({ result: "Something went wrong..please try again later" })
        }
        res.send({result,auth:token})
    })
})

app.post('/login', async (req, res) => {
    // console.log(req.body);
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select('-password')
        if (user) {
            jwt.sign({user},jwtKey,{expiresIn:"2h"},(err,token)=>{
                if(err) {
                    res.send({ result: "Something went wrong..please try again later" })
                }
                res.send({user,auth:token})
            })
            // res.send(user)
        }
        else {
            res.send({ result: "No record found" })
        }
    }
    else {
        res.send({ result: "No record found" })
    }
})

app.post('/add-product',verifyToken, async (req, res) => {
    let product = new Product(req.body)
    let result = await product.save()
    res.send(result)
})

app.get('/products-list',verifyToken, async (req, res) => {
    const product = await Product.find()
    if (product) {
        res.send(product)
    } else {
        res.send({ result: "No Record Found" })
    }
})

app.delete('/products/:id',verifyToken,async (req,res)=>{
    const result = await Product.deleteOne({_id:req.params.id})
    res.send(result)
})

//api for get single product
app.get('/products/:id',verifyToken,async (req,resp)=>{
    let res = await Product.findOne({_id:req.params.id})
    console.log('res',res);
    if(res) {
        resp.send(res)
    } else {
        resp.send({result:"No Record Found"})
    }
})

app.put('/product/:id',verifyToken,async(req,res)=>{
    let result = await Product.updateOne(
        {_id:req.params.id},
        {
            $set : req.body
        }
    )
    res.send(result)
})

app.get('/search/:key',verifyToken, async (req,res) =>{
    let result = await Product.find({
        "$or" :[
            // {name: {$regex: req.params.key}},
            {category: {$regex: req.params.key}}
        ]
    })
    res.send(result)
})

function verifyToken(req,resp,next) {
    let token = req.headers['authorization']
    if(token) {
        token = token.split(' ')[1]
        jwt.verify(token, jwtKey, (err,valid)=>{
            if(err) {
                resp.status(401).send({result:"please provide valid token with header"})
            }else {
                next()
            }
        })
    } else {
        resp.status(403).send({result:"please add token wiht header"})
    }
    // next()
}

app.listen(5000) //run application on 5000 port
