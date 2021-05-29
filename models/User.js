const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:String,
        default:Date()
    }
}, { collection: 'User' });
module.exports = mongoose.model('User', ObjSchema);