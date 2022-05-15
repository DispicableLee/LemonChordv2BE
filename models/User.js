//email
//full name
//username

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: String,
    fullName: String,
    userName: String 

})

module.exports = mongoose.model("User", UserSchema);