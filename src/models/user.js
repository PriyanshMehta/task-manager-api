const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    age: {
        type: Number,
        default: 0,
        validate(value){
            if(value<0)
                throw new Error('Age should be positive')
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value))
                throw new Error("Enter a valid E-mail")
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 7,
        trim: true,
        validate(value){
            if(value.includes("password"))
                throw new Error("Password should not contain 'password' ")
        }
    },
    tokens: [{
        token:{
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// to send only the required data back
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}
//a web auth token is generated for every user 
userSchema.methods.generateAuthToken = async function(){
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_SECRET_KEY)
    this.tokens = this.tokens.concat({token})
    await this.save()
    return token
}

//this is for static functions
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})

    if(!user)
        throw new Error('Unable to login!')

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch)
        throw new Error('Unable to login!')

    return user
}

// Hash the plain text password before saving
userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    //if we don't end with next(), application will just hang on this codeblock.
    next()
})

//deleted all the task associated with a user before deleting user
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})

    next()

})

//as we have created a userSchema beforehand, we can now use additional functionalities.
const User = mongoose.model('User', userSchema)

module.exports  = User