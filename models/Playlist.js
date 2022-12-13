const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    name: String,
    songs: Array,
    likes: Array,
    userId: String,
    image: String

})

module.exports = mongoose.model("Playlist", PlaylistSchema);