const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true
})

// const User = mongoose.model('User',
//     {
//         name: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         age: {
//             type: Number,
//             default: 0,
//             validate(value){
//                 if(value<0)
//                     throw new Error('Age should be positive')
//             }
//         },
//         email: {
//             type: String,
//             required: true,
//             trim: true,
//             lowercase: true,
//             validate(value){
//                 if(!validator.isEmail(value))
//                     throw new Error("Enter a valid E-mail")
//             }
//         },
//         password: {
//             type: String,
//             required: true,
//             minLength: 7,
//             trim: true,
//             validate(value){
//                 if(value.includes("password"))
//                     throw new Error("Password should not contain 'password' ")
//             }
//         }
//     }
// )

// const me = new User({
//     name: "Viral",
//     age: 27,
//     email: "priyanshmehta@gmail.com",
//     password: "576password123"
// })

// me.save().then(() => {
//     console.log(me);
// }).catch((error)=>{
//     console.log(error);
// })

// const Task = mongoose.model('Task',
//     {
//         description: {
//             type: String,
//             required: true,
//             trim: true
//         },

//         completed: {
//             type: Boolean,
//             default: false
//         }
//     }
// )

// const task = new Task({
//     description: "    mong mong mong",
// })

// task.save().then(() => {
//     console.log(task);
// }).catch((error) => {
//     console.log(error);
// })
