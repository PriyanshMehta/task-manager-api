const express = require('express')
const Task = require("../models/task.js")
const router = new express.Router()
const auth = require("../middleware/auth.js")
const { request } = require('express')

router.post("/tasks", auth, async (req,res)=> {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
    // task.save().then(()=>{
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(400)
    //     res.send(e)
    // })
})




//to fetch all tasks by specific user
router.get('/tasks', auth, async (req,res)=>{
    
    try{
        // console.log(req.query)
        // Set Default find Conditions
        const findWhat = {
            owner: req.user._id,
        };
        
        // Add/Set Optional Find Conditions
        if(req.query.completed) {
                findWhat.completed = req.query.completed === 'true';
        }
        
        // Set Default Find Options
        const findOptions = {
            limit: 10,
            skip: 0,
            sort:{
                createdAt:-1
            } 
        };
        
        // Add/Set Optional Find Options
        if(req.query.limit) {
            findOptions.limit = parseInt(req.query.limit);
        }
        
        if(req.query.skip) {
            findOptions.skip = parseInt(req.query.skip);
        }
    
        
        //  ...and then inside my Try/Catch block...
        const tasks = await Task.find(findWhat, null, findOptions);
        
        res.status(201).send(tasks)
        // await req.user.populate({
        //     path: "tasks"
        // }).execPopulate()
        
    }catch(e){
        res.status(500).send(e)
    }
    // Task.find({}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })
})

//to fetch task by id
router.get('/tasks/:id',auth,async (req,res)=>{
    const _id = req.params.id
    // console.log(_id)
    // console.log(req.user._id.toString())
    try{
        // const task = await Task.findById(req.params.id)
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task)
            return res.status(404).send("Task not found.")
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
    // Task.findById(req.params.id).then((task)=>{
    //     if(!task)
    //         return res.status(404).send("Task not found.")
    //     res.send(task)
    // }).catch((e)=>{
    //     res.status(500).send(e)
    // })
})



//to update the task with given id
router.patch("/tasks/:id", auth, async (req,res)=> {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["description", "completed"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation)
        res.status(400).send("Invalid update.")
    try{
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        // const task = Task.findById(req.params.id)
        if(!task)
            return res.status(404).send("No such Task found")

        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        task.save()
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
        
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})



//to delete a task with given id
router.delete("/tasks/:id", auth, async (req, res) => {
    // console.log(req.params.id)
    try{
        const task = await Task.findOne({_id:req.params.id, owner: req.user._id})
        if(!task)
            return res.status(404).send("No such Task found")
        await task.remove()
        res.send(task)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router