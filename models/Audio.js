const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AudioSchema = new Schema({
    name: String,
    key: String,
    likes: Array,
    userId: String,
    image: String,
    bucket: String,
    location: String,
    comments: Array
    
})

module.exports = mongoose.model("Audio", AudioSchema);