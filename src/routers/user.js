const express = require('express')
const User = require("../models/user.js")
const router = new express.Router()
const auth = require("../middleware/auth.js")
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancellationEmail} = require("../emails/account.js")

const upload = multer({
    limits: {
        fileSize: 15000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error("Please upload an image."))
        }
        return cb(undefined, true)
    }
})

//here we will be sending info to our server, so we will use router.post
router.post("/users", async (req,res)=> {
    const user = new User(req.body)
    try{
        await user.save()
        sendWelcomeEmail(user.name , user.email)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})

    }catch(e){
        res.status(400).send(e)
    }
    // user.save().then(()=>{
    //     res.send(user)
    // }).catch((e)=>{
    //     res.status(400)
    //     res.send(e)
    // })
})



router.post('/users/me/avatar', auth, upload.single('avatar'), async(req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({height: 250, width: 250, rx: 1150, ry:1150}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.status(200).send()
}, (error,req,res,next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send()
})

router.get('/users/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.status(200).send(user.avatar)
    } catch(e){
        res.status(400).send()
    }
    
})


//to get list of all users
// updated to get my info on authentication
router.get("/users/me",auth, async (req,res)=> {
    res.send(req.user)

    // try{
    //     const users = await User.find({})
    //     res.status(201).send(users)
    // }catch(e){
    //     res.status(500).send(e)
    // }
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })
})

//sgning up a new user
router.post("/users/signup", async(req,res)=>{
    const user = new User(req.body)
    try{
        await user.save()
        const token = await user.generateAuthToken()
        res.send({user,token})
        
    }catch(e){
        res.status(400).send(e)
    }
})
//checking login info using email and password
router.post("/users/login", async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        //find by Credentials was a method for whole User class, whereas generateAuthToken is for a particular instance
        const token = await user.generateAuthToken()
        res.send({user,token})
    }catch(e){
        res.status(400).send(e)
    }
})


//logout a particular token
router.post("/users/logout", auth,  async(req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !==req.token
        })

        await req.user.save()
        res.send()
    }catch(e){
        res.status(500).send()
    }
})

//logout all tokens associated with the user
router.post("/users/logoutAll", auth, async(req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(200).send()
    }catch(e){
        res.status(500).send()
    }
})




//to get user with a given id
// router.get("/users/:id", async (req,res)=>{
//     try{
//         const user = await User.find({_id: req.params.id})
//         if(user.length==0)
//             return res.status(404).send("User not found.")
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
//     // User.find({_id: req.params.id}).then((user)=>{
//     //     if(user.length==0)
//     //         return res.status(404).send("User not found.")
//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send(e)
//     // })
// })

//to update user with given id
// router.patch("/users/:id", async (req,res)=> {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ["name", "email", "password", "age"]
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if(!isValidOperation)
//         res.status(400).send("Invalid update.")
//     try{
//         const user = await User.findById(req.params.id)

//         updates.forEach((update)=>{
//             user[update] = req.body[update]
//         })

//         await user.save()
//         //we have to restructure code as here no save operation takes place so we find user by id, make changes and then save the user.
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
//         if(!user)
//             return res.status(404).send("No such User found")
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })

//to update my own results
router.patch("/users/me",auth, async (req,res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "email", "password", "age"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation)
        res.status(400).send("Invalid update.")
    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        })

        await req.user.save()
        //we have to restructure code as here no save operation takes place so we find user by id, make changes and then save the user.
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
        if(!req.user)
            return res.status(404).send("No such User found")
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

//to delete a user with given id
// router.delete("/users/:id", async (req, res) => {
//     // console.log(req.params.id)
//     try{
//         const user = await User.findByIdAndDelete(req.params.id)
//         if(!user)
//             return res.status(404).send("No such User found")
//         res.send(user)
//     }catch(e){
//         res.status(500).send(e)
//     }
// })

router.delete("/users/me", auth, async (req, res) => {
    // console.log(req.params.id)
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)
        //     return res.status(404).send("No such User found")
        sendCancellationEmail(req.user.name, req.user.email)
        await req.user.remove()
        
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router