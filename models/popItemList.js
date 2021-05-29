const { Int32 } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjSchema = new Schema({
    _id:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    cost:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    }
}, { collection: 'popItemList' });
module.exports = mongoose.model('popItemList', ObjSchema);