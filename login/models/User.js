const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    permission_level: {
        type: Number,
        default: 1
    },
    registration_date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model('users', User)