var ObjectID = require("mongodb").ObjectId;

const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Audio = require("../../models/Audio");

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

// GET: get all audio/songs in the Audio schema table
router.get("/search/all/songs", async(req,res)=>{
    console.log("hitting all songs endpoint")
    const audios = await Audio.find();
    return res.status(200).send(audios)
})

// DELETE: delete a song/audio from a user
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





module.exports = router;