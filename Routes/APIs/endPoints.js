var ObjectID = require("mongodb").ObjectId;

const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Audio = require("../../models/Audio");
const e = require("express");
const Playlist = require("../../models/Playlist");


//============================================== USER ROUTES =====================================================

// POST a new user
//http://localhost:4002/api/v2/endPoints/new/user
router.post("/new/user", async(req,res)=>{
    const user = await User.findOne({email:req.body.email})
    if(user){
        return res.status(400).send({})
    }else{
        const newUser = new User(req.body)
        newUser.save().catch(err=>console.log(err))
        return res.status(200).send(newUser);
    }
})

// GET a user by email
//http://localhost:4002/api/v2/endPoints/search/user/:email
router.get("/search/user/:email", async(req,res)=>{
    console.log("searching...")
    const eMail = req.params.email;
    const user = await User.findOne({email:eMail});
    if(user){
        return res.status(200).send(user);
    }else{
        return res.status(400).send({})
    }
})

// GET all users 
//http://localhost:4002/api/v2/endPoints/search/all/users
router.get("/search/all/users", async (req,res)=>{
    const users = await User.find();
    return res.status(200).send(users)
})

// GET a user by their id
//http://localhost:4002/api/v2/endPoints/search/users/:id
router.get("/search/users/:id", async(req,res)=>{
    const userId = req.params.id
    const userObjectId = ObjectID(userId)
    const user = await User.findById(userObjectId)
    if(user){
        return res.status(200).send(user)
    }else{
        console.log("failure")
        return res.status(400).send({})
    }
})

//==================================================== SONG/AUDIO ROUTES ==========================================================

// POST a new song
//http://localhost:4002/api/v2/endPoints/new/audio/:id
router.post("/new/audio/:id", async(req,res)=>{
    const userID = req.params.id;
    const UserObjectId = ObjectID(userID);
    const user = await User.findById(UserObjectId);
    if(user){
        const newAudio = new Audio(req.body)
        newAudio.save().catch(err=>console.log(err))
        const audioId = newAudio._id;
        var updatedUserArray = user.postedSongs;
        updatedUserArray.push(audioId);
        var userQuery = {_id:user._id};
        var userUpdatedValues = {
            email: user.email,
            fullName: user.fullName,
            userName: user.userName, 
            postedSongs: updatedUserArray
        }
        await User.findOneAndUpdate(userQuery,userUpdatedValues);
        return res.status(200).send(newAudio);
    }else{
        res.status(400).send({})
    }
})

// GET: get a single audio/song by its id
//http://localhost:4002/api/v2/endPoints/search/audio/:id
router.get("/search/audio/:id", async(req,res)=>{
    console.log("looking for ur mom")
    const id = req.params.id;
    const AudioObjectId = ObjectID(id);
    const audio = await Audio.findById(AudioObjectId);
    if(audio){
        return res.status(200).send(audio);
    }else{
        return res.status(400).send({})
    }
})

//GET all songs from a specific user id
//http://localhost:4002/api/v2/endPoints/search/all/usersongs/:userid
//           NEEDS WORK
router.get("/search/all/usersongs/:userid", async(req,res)=>{
    const id = req.params.userid
    const userObjectId = ObjectID(id)
    const user = await User.findById(userObjectId)
    if(user){
        const userSongs = await Audio.find({userId: id})
        return res.status(200).send(userSongs)

    }else{
        return res.status(400).send({})
    }
})


// GET: get all audio/songs in the Audio schema table
//http://localhost:4002/api/v2/endPoints/search/all/songs
router.get("/search/all/songs", async(req,res)=>{
    console.log("hitting all songs endpoint")
    const audios = await Audio.find();
    return res.status(200).send(audios)
})


// DELETE: delete a song/audio from a user
//http://localhost:4002/api/v2/endPoints/delete/:audioID/:userID
router.delete("/delete/:audioID/:userID", async(req,res)=>{
    //find the user =============================================
    console.log("calling delete endpoint")
    const userId = req.params.userID;
    const UserObjectId = ObjectID(userId);
    const user = await User.findById(UserObjectId);
    if(user){
        //find the audio ========================================
        const audioId = req.params.audioID;
        const audioObjectId = ObjectID(audioId);
        const audio = await Audio.findById(audioObjectId);
        if(audio){
            //delete the audio from the user.postedSongs ========================
            const audioD = await Audio.findOneAndDelete({_id: audioObjectId})
            //update the user schema ============================================
            var userSongs = user.postedSongs;
            //filter out the audio ==============================================
            var filteredSongs = userSongs.filter((id)=>!(id.equals(audioObjectId)))
            var userQuery = {_id:user.id}
            var userUpdatedValues = {
                email: user.email,
                fullName: user.fullName,
                userName: user.userName, 
                postedSongs: filteredSongs
            }
            await User.findOneAndUpdate(userQuery, userUpdatedValues)
            return res.status(200).send(audioD)
        }else{
            return res.status(400).send()
        }
    }else{
        return res.status(400).send()
    }
})

// PUT: like/un-like audio/song 
//http://localhost:4002/api/v2/endPoints/like/:audioid/:userid
router.put("/like/:audioid/:userid", async (req,res)=>{
    //see if the user is logged in first
    console.log("ur mom")
    const userid = req.params.userid;
    const userObjectId = ObjectID(userid);
    const user = await User.findById(userObjectId);
    if(user){
        //if the user exists, find the audio file
        const audioid = req.params.audioid;
        const audioObjectId = ObjectID(audioid);
        const audio = await Audio.findById(audioObjectId);
        const likeD = audio.likes;
        if(audio){
            //if the audio file exists, see if the user's id is already in the likes array
            if(likeD.includes(userObjectId)){
                //if the user already liked it, filter their id out of the array    
                const unLiked = likeD.filter((id)=>!(id.equals(userObjectId)));
                //update the audio schema
                var audioQuery = {_id:audio._id}
                var audioUpdatedValues = {
                    name: audio.name,
                    bucket: audio.bucket,
                    key: audio.key,
                    location: audio.location,
                    likes: unLiked,
                    userId: audio.userId
                }
                await Audio.findOneAndUpdate(audioQuery, audioUpdatedValues);
                return res.status(200).send(audioUpdatedValues)
            }else{
                //if the user has not liked it, add their id to the array
                likeD.push(userObjectId);
                var audioQuery = {_id:audio._id}
                var audioUpdatedValues = {
                    name: audio.name,
                    bucket: audio.bucket,
                    key: audio.key,
                    location: audio.location,
                    likes: likeD,
                    userId: audio.userId
                }
                await Audio.findOneAndUpdate(audioQuery, audioUpdatedValues);
                return res.status(200).send(audioUpdatedValues)
            }
        }else{
            return res.status(400).send({})
        }
    }else{
        return res.status(400).send({})
    }
})



// ========================= playlist stuff ============================================

// POST a new playlist
//http://localhost:4002/api/v2/endPoints/new/playlist/:userid
router.post("/new/playlist/:userid", async(req,res)=>{
    const userId = req.params.userid
    const userObjectId = ObjectID(userId)
    const user = await User.findById(userObjectId)
    if(user){
        var uPlaylist = user.postedPlaylists
        console.log(user.postedPlaylists)
        const newPlaylist = new Playlist(req.body)
        newPlaylist.save().catch(err=>console.log(err))
        uPlaylist.unshift(newPlaylist._id)
        var userQuery = {_id:user._id}
        var userUpdatedValues = {
                userName: user.userName, 
                email: user.email,
                fullName: user.fullName,
                image: user.image,
                postedSongs: user.postedSongs,
                postedPlaylists: uPlaylist,
        }
        await User.findOneAndUpdate(userQuery, userUpdatedValues)
        return res.status(200).send(userUpdatedValues)
    }else{
        return res.status(400).send({})
    }
})

// GET all playlists
//http://localhost:4002/api/v2/endPoints/search/all/playlists
router.get("/search/all/playlists", async(req,res)=>{
    const playlists = await Playlist.find()
    return res.status(200).send(playlists)
})

// POST a song to a playlist
//http://localhost:4002/api/v2/endPoints/add/song/:playlistid/:songid
router.post("/add/song/:playlistid/:songid", async(req,res)=>{
    const playlistId = req.params.playlistid
    const playlistObjectID = ObjectID(playlistId)
    const playlist = await Playlist.findById(playlistObjectID)
    if(playlist){
        const songid = req.params.songid
        const songObjectId = ObjectID(songid)
        const song = await Audio.findById(songObjectId)
        if(song){
            var playlistSongs = playlist.songs
            playlistSongs.unshift(songid)
            const playlistQuery = {_id:playlist._id}
            const playlistUpdatedValues = {
                name: playlist.name,
                songs: playlistSongs,
                likes: playlist.likes,
                userId: playlist.userId,
                image: playlist.image
            }
            await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues)
            return res.status(200).send(playlistUpdatedValues)
        }else{
            return res.status(400).send({})
        }
    }else{
        return res.status(400).send({})
    }
})

// DELETE a song from a playlist
//http://localhost:4002/api/v2/endPoints/remove/song/:playlistid/:songid
router.delete("/remove/song/:playlistid/:songid", async(req,res)=>{
    const playlistId = req.params.playlistid
    const playlistObjectID = ObjectID(playlistId)
    const playlist = await Playlist.findById(playlistObjectID)
    if(playlist){
        const songid = req.params.songid
        const playlistSongs = playlist.songs
        if(playlistSongs.includes(songid)){
            var updatedPlaylist = playlistSongs.filter((id)=>!(id.equals(songid)))
            const playlistQuery = {_id:playlist._id}
            const playlistUpdatedValues = {
                name: playlist.name,
                songs: updatedPlaylist,
                likes: playlist.likes,
                userId: playlist.userId,
                image: playlist.image
            }
            await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues)
            return res.status(200).send(playlistUpdatedValues)
        }else{
            return res.status(400).send({})
        }
    }else{
        return res.status(400).send({})
    }
})





module.exports = router;