//email
//full name
//username

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName: String, 
    password: String,
    email: String,
    fullName: String,
    image: String,
    postedSongs: Array,
    postedPlaylists: Array,
    comments: Array
})

module.exports = mongoose.model("User", UserSchema);