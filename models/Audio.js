const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AudioSchema = new Schema({
    name: String,
    bucket: String,
    key: String,
    location: String,
    likes: Array,
    userId: String

})

module.exports = mongoose.model("Audio", AudioSchema);