const mongoose = require('mongoose');

var Schema = mongoose.Schema;

commectDB().catch(err => console.log(err));

async function commectDB() {
    await mongoose.connect('mongodb://localhost:27017/');
};

module.exports.user=mongoose.model('User',new Schema({
    name:String,
    handle: String,
    password: String,
    phone:String,
    email:String,
    friends:[]
},{strict: false}));
module.exports.online=mongoose.model('online',new Schema({
    handle:String,
    connection_id:String
}));
module.exports.messages=mongoose.model('message',new Schema({
    message : String,
    sender  : String,
    reciever: String,
    date    : Date
}));