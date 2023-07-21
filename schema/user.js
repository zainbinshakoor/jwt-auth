const mongoose = require('mongoose');
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        required:false
    },
    resetToken:{
        type:String,
        required:false
    },
    role:{
        type:String,
        required:true
    }
})
const users = mongoose.model('users', doctorSchema);
module.exports = users  