const express = require('express')
require("./db/mongoose.js")
const User = require("./models/user.js")
const Task = require("./models/task.js")
const userRouter = require("./routers/user.js")
const taskRouter = require("./routers/task.js")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()

const port = process.env.PORT


// Middleware code in another file
// app.use((req,res,next)=>{
//     // console.log(req.method)
//     // console.log(req.path)
//     // next()
//     res.status(503).send("Site is Under Maintenance")
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

// Express Middleware
// without 
// new request -> run route handler

// with
// new request -> do something -> run route handler

// const multer = require('multer')
// const upload = multer({
//     dest: "images"
// })

// app.post('/upload', upload.single('upload'), (req,res)=>{
//     res.send()
// })


app.listen(port, ()=> {
    console.log("Server is up on port " + port);
})

const myFunction = async () =>{
    const token = jwt.sign({_id:"abc123"},"howaboutanewcourse", {expiresIn: '10 seconds'})
    console.log(token)

    const data = jwt.verify(token,"howaboutanewcourse" )
    console.log(data)
    // const password = "halo123"
    // const hashedPassword = await bcrypt.hash(password, 8)
    // console.log(password)
    // console.log(hashedPassword)
    // $2a$08$yHvbVSQQesg.qAUjcZDtaeoJxBeu5m14RFp5opE08SmdwzdNy8cxi
}

// myFunction()