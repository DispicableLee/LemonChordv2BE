var ObjectID = require("mongodb").ObjectId;

const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Audio = require("../../models/Audio");
const Playlist = require("../../models/Playlist");
const Comment = require("../../models/Comment")

const e = require("express");
//============================================== USER ROUTES =====================================================

// POST a new user
//http://localhost:4002/api/v2/endPoints/new/user
router.post("/new/user", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send({});
  } else {
    const newUser = new User(req.body);
    newUser.save().catch((err) => console.log(err));
    return res.status(200).send(newUser);
  }
});

//GET a user by password and username
//http://localhost:4002/api/v2/endPoints/search/user/:username/:password
router.get("/search/user/:username/:password", async (req, res) => {
  const user = await User.findOne({ password: req.params.password });
  if (user) {
    if (user.userName === req.params.username) {
      return res.status(200).send(user);
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});

// GET a user by email ====================================
//http://localhost:4002/api/v2/endPoints/search/user/:email
router.get("/search/user/:email", async (req, res) => {
  console.log("searching...");
  const eMail = req.params.email;
  const user = await User.findOne({ email: eMail });
  if (user) {
    return res.status(200).send(user);
  } else {
    return res.status(400).send({});
  }
});

// GET all users ========================================
//http://localhost:4002/api/v2/endPoints/search/all/users
router.get("/search/all/users", async (req, res) => {
  const users = await User.find();
  return res.status(200).send(users);
});

// GET a user by their id ===============================
//http://localhost:4002/api/v2/endPoints/search/users/:id
router.get("/search/users/:id", async (req, res) => {
  const userId = req.params.id;
  const userObjectId = ObjectID(userId);
  const user = await User.findById(userObjectId);
  if (user) {
    return res.status(200).send(user);
  } else {
    console.log("failure");
    return res.status(400).send({});
  }
});

// PUT edit a user's information ===========
//http://localhost:4002/api/v2/endPoints/edit/:userid
//         NEEDS WORK
router.put("/edit/:userid", async(req,res)=>{
    const userID = req.params.userid
    const userObjectId = ObjectID(userID)
    const user = await User.findById(userObjectId)
    if(user){
        var userQuery = {_id:user._id}
        var userUpdatedValues = {
            userName: req.body, 
            password: req.body,
            email: req.body,
            fullName: req.body,
            image: req.body,
            postedSongs: user.postedSongs,
            postedPlaylists: user.postedPlaylists,
        }
        await User.findOneAndUpdate(userQuery, userUpdatedValues)
        return res.status(200).send(userUpdatedValues)
    }else{
        return res.status(400).send({})
    }
})

// DELETE a user from the database ====================
//http://localhost:4002/api/v2/endPoints/delete/:userID
router.delete("/delete/:userID", async(req,res)=>{
    const userID = req.params.userID
    const userObjectId = ObjectID(userID)
    const user = await User.findById(userObjectId)
    if(user){
        const deletedUser = await User.findOneAndDelete({_id: userObjectId})
        return res.status(200).send(deletedUser)
    }else{
        return res.status({})
    }
})






//==================================================== SONG/AUDIO ROUTES ==========================================================

// POST a new song
//http://localhost:4002/api/v2/endPoints/new/audio/:id
router.post("/new/audio/:id", async (req, res) => {
  const userID = req.params.id;
  const UserObjectId = ObjectID(userID);
  const user = await User.findById(UserObjectId);
  if (user) {
    const newAudio = new Audio(req.body);
    newAudio.save().catch((err) => console.log(err));
    const audioId = newAudio._id;
    var updatedUserArray = user.postedSongs;
    updatedUserArray.push(audioId);
    var userQuery = { _id: user._id };
    var userUpdatedValues = {
      email: user.email,
      fullName: user.fullName,
      userName: user.userName,
      postedSongs: updatedUserArray,
    };
    await User.findOneAndUpdate(userQuery, userUpdatedValues);
    return res.status(200).send(newAudio);
  } else {
    res.status(400).send({});
  }
});

// GET: get a single audio/song by its id
//http://localhost:4002/api/v2/endPoints/search/audio/:id
router.get("/search/audio/:id", async (req, res) => {
  console.log("looking for ur mom");
  const id = req.params.id;
  const AudioObjectId = ObjectID(id);
  const audio = await Audio.findById(AudioObjectId);
  if (audio) {
    return res.status(200).send(audio);
  } else {
    return res.status(400).send({});
  }
});

//GET all songs from a specific user id
//http://localhost:4002/api/v2/endPoints/search/all/usersongs/:userid
router.get("/search/all/usersongs/:userid", async (req, res) => {
  const id = req.params.userid;
  const userObjectId = ObjectID(id);
  const user = await User.findById(userObjectId);
  if (user) {
    const userSongs = await Audio.find({ userId: id });
    return res.status(200).send(userSongs);
  } else {
    return res.status(400).send({});
  }
});

// GET: get all audio/songs in the Audio schema table
//http://localhost:4002/api/v2/endPoints/search/all/songs
router.get("/search/all/songs", async (req, res) => {
  console.log("hitting all songs endpoint");
  const audios = await Audio.find();
  return res.status(200).send(audios);
});

// GET all songs a user has liked
//http://localhost:4002/api/v2/endPoints/search/all/liked/:userid
router.get("/search/all/liked/:userid", async (req, res) => {
  const userID = req.params.userid;
  const userObjectId = ObjectID(userID);
  const user = await User.findById(userObjectId);
  if (user) {
    const audios = await Audio.find();
    const likedSongs = audios.filter((song) => song.likes.includes(userID));
    return res.status(200).send(likedSongs);
  } else {
    return res.status(400).send({});
  }
});

// DELETE: delete a song/audio from a user
//http://localhost:4002/api/v2/endPoints/delete/:audioID/:userID
router.delete("/delete/:audioID/:userID", async (req, res) => {
  //find the user =============================================
  console.log("calling delete endpoint");
  const userId = req.params.userID;
  const UserObjectId = ObjectID(userId);
  const user = await User.findById(UserObjectId);
  if (user) {
    //find the audio ========================================
    const audioId = req.params.audioID;
    const audioObjectId = ObjectID(audioId);
    const audio = await Audio.findById(audioObjectId);
    if (audio) {
      //delete the audio from the user.postedSongs ========================
      const audioD = await Audio.findOneAndDelete({ _id: audioObjectId });
      //update the user schema ============================================
      var userSongs = user.postedSongs;
      //filter out the audio ==============================================
      var filteredSongs = userSongs.filter((id) => !(id.equals(audioObjectId)));
      var userQuery = { _id: user.id };
      var userUpdatedValues = {
        email: user.email,
        fullName: user.fullName,
        userName: user.userName,
        postedSongs: filteredSongs,
      };
      await User.findOneAndUpdate(userQuery, userUpdatedValues);
      return res.status(200).send(audioD);
    } else {
      return res.status(400).send();
    }
  } else {
    return res.status(400).send();
  }
});

// PUT: like/un-like audio/song
//http://localhost:4002/api/v2/endPoints/like/song/:audioid/:userid
router.put("/like/song/:audioid/:userid", async (req, res) => {
  //see if the user is logged in first
  console.log("ur mom");
  const userid = req.params.userid;
  const userObjectId = ObjectID(userid);
  const user = await User.findById(userObjectId);
  if (user) {
    //if the user exists, find the audio file
    const audioid = req.params.audioid;
    const audioObjectId = ObjectID(audioid);
    const audio = await Audio.findById(audioObjectId);
    const likeD = audio.likes;
    if (audio) {
      //if the audio file exists, see if the user's id is already in the likes array
      if (likeD.includes(userObjectId)) {
        //if the user already liked it, filter their id out of the array
        const unLiked = likeD.filter((id) => !id.equals(userObjectId));
        //update the audio schema
        var audioQuery = { _id: audio._id };
        var audioUpdatedValues = {
          name: audio.name,
          bucket: audio.bucket,
          key: audio.key,
          location: audio.location,
          likes: unLiked,
          userId: audio.userId,
        };
        await Audio.findOneAndUpdate(audioQuery, audioUpdatedValues);
        return res.status(200).send(audioUpdatedValues);
      } else {
        //if the user has not liked it, add their id to the array
        likeD.push(userObjectId);
        var audioQuery = { _id: audio._id };
        var audioUpdatedValues = {
          name: audio.name,
          bucket: audio.bucket,
          key: audio.key,
          location: audio.location,
          likes: likeD,
          userId: audio.userId,
        };
        await Audio.findOneAndUpdate(audioQuery, audioUpdatedValues);
        return res.status(200).send(audioUpdatedValues);
      }
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});

//PUT update a song's information
//






// ================================================== playlist endpoints =========================================================

// POST a new playlist
//http://localhost:4002/api/v2/endPoints/new/playlist/:userid
router.post("/new/playlist/:userid", async (req, res) => {
  const userId = req.params.userid;
  const userObjectId = ObjectID(userId);
  const user = await User.findById(userObjectId);
  if (user) {
    var uPlaylist = user.postedPlaylists;
    console.log(user.postedPlaylists);
    const newPlaylist = new Playlist(req.body);
    newPlaylist.save().catch((err) => console.log(err));
    uPlaylist.unshift(newPlaylist._id);
    var userQuery = { _id: user._id };
    var userUpdatedValues = {
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      image: user.image,
      postedSongs: user.postedSongs,
      postedPlaylists: uPlaylist,
    };
    await User.findOneAndUpdate(userQuery, userUpdatedValues);
    return res.status(200).send(userUpdatedValues);
  } else {
    return res.status(400).send({});
  }
});

// GET all playlists
//http://localhost:4002/api/v2/endPoints/search/all/playlists
router.get("/search/all/playlists", async (req, res) => {
  const playlists = await Playlist.find();
  return res.status(200).send(playlists);
});


// GET all playlists from one user
//http://localhost:4002/api/v2/endPoints/search/all/playlists/:userid
router.get("/search/all/playlists/:userid", async (req, res) => {
  const userID = req.params.userid;
  const userObjectId = ObjectID(userID);
  const user = await User.findById(userObjectId);
  if (user) {
    const userPlaylists = await Playlist.find({ userId: req.params.userid });
    return res.status(200).send(userPlaylists);
  } else {
    return res.status(400).send({});
  }
});

//GET all playlists a user has liked
//http://localhost:4002/api/v2/endPoints/search/all/liked/playlists/:userid
router.get("/search/all/liked/playlists/:userid", async(req,res)=>{
    const userID = req.params.userid
    const userObjectId = ObjectID(userID)
    const user = await User.findById(userObjectId)
    if(user){
        const allPlaylists = await Playlist.find()
        const likedPlaylists = allPlaylists.filter((playlist)=>playlist.likes.includes(userID))
        return res.status(400).send(likedPlaylists)
    }else{
        return res.status(400).send({})
    }
})





//GET all songs in a playlist
//http://localhost:4002/api/v2/endPoints/search/all/songs/playlist/:playlistid
router.get("/search/all/songs/playlist/:playlistid", async (req, res) => {
  const playlistid = req.params.playlistid;
  const playlistObjectID = ObjectID(playlistid);
  const playlist = await Playlist.findById(playlistObjectID);
  if (playlist) {
    const playlistSongs = playlist.songs;
    const fetchedSongs = await Audio.find({ _id: { $in: playlistSongs } });
    return res.status(200).send(fetchedSongs);
  } else {
    return res.status(400).send({});
  }
});

// PUT like/unlike a playlist
//http://localhost:4002/api/v2/endPoints/like/playlist/:playlistid/:userid
router.put("/like/playlist/:playlistid/:userid", async (req, res) => {
  const userId = req.params.userid;
  const userObjectId = ObjectID(userId);
  const user = await User.findById(userObjectId);
  if (user) {
    const playlistId = req.params.playlistid;
    const playlistObjectID = ObjectID(playlistId);
    const playlist = await Playlist.findById(playlistObjectID);
    const playlistLikes = playlist.likes;
    if (playlist) {
      if (playlistLikes.includes(userId)) {
        //======= if the playlist likes array contains the user id
        const unLiked = playlistLikes.filter((id) => !id==(userId));
        var playlistQuery = { _id: playlist._id };
        var playlistUpdatedValues = {
          name: playlist.name,
          songs: playlist.songs,
          likes: unLiked,
          userId: playlist.userId,
          image: playlist.image,
        };
        await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues);
        return res.status(200).send(playlistUpdatedValues);
      } else {
        //=========== if the playlist likes array does not contain the user id
        playlistLikes.unshift(userId);
        var playlistQuery = { _id: playlist._id };
        var playlistUpdatedValues = {
          name: playlist.name,
          songs: playlist.songs,
          likes: playlistLikes,
          userId: playlist.userId,
          image: playlist.image,
        };
        await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues);
        return res.status(200).send(playlistUpdatedValues);
      }
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});

// POST a song to a playlist
//http://localhost:4002/api/v2/endPoints/add/song/:playlistid/:songid
router.post("/add/song/:playlistid/:songid", async (req, res) => {
  const playlistId = req.params.playlistid;
  const playlistObjectID = ObjectID(playlistId);
  const playlist = await Playlist.findById(playlistObjectID);
  if (playlist) {
    const songid = req.params.songid;
    const songObjectId = ObjectID(songid);
    const song = await Audio.findById(songObjectId);
    if (song) {
      var playlistSongs = playlist.songs;
      playlistSongs.unshift(songid);
      const playlistQuery = { _id: playlist._id };
      const playlistUpdatedValues = {
        name: playlist.name,
        songs: playlistSongs,
        likes: playlist.likes,
        userId: playlist.userId,
        image: playlist.image,
      };
      await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues);
      return res.status(200).send(playlistUpdatedValues);
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});

// DELETE a song from a playlist
//http://localhost:4002/api/v2/endPoints/remove/song/:playlistid/:songid
router.delete("/remove/song/:playlistid/:songid", async (req, res) => {
  const playlistId = req.params.playlistid;
  const playlistObjectID = ObjectID(playlistId);
  const playlist = await Playlist.findById(playlistObjectID);
  if (playlist) {
    const songid = req.params.songid;
    const playlistSongs = playlist.songs;
    if (playlistSongs.includes(songid)) {
      var updatedPlaylist = playlistSongs.filter((id) => !id.equals(songid));
      const playlistQuery = { _id: playlist._id };
      const playlistUpdatedValues = {
        name: playlist.name,
        songs: updatedPlaylist,
        likes: playlist.likes,
        userId: playlist.userId,
        image: playlist.image,
      };
      await Playlist.findOneAndUpdate(playlistQuery, playlistUpdatedValues);
      return res.status(200).send(playlistUpdatedValues);
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});

// DELETE a playlist
//http://localhost:4002/api/v2/endPoints/delete/playlist/:playlistId/:userID
router.delete("/delete/playlist/:playlistId/:userID", async (req, res) => {
  const userID = req.params.userID;
  const userObjectId = ObjectID(userID);
  const user = await User.findById(userObjectId);
  if (user) {
    console.log("found user")
    const playlistId = req.params.playlistId;
    const playlistObjectID = ObjectID(playlistId);
    const playlist = await Playlist.findById(playlistObjectID)
    console.log("found playlist")
    if (playlist) {
        console.log("hi")
      const deletedPlaylist = await Playlist.findOneAndDelete({_id: playlistObjectID})
      var userPlaylists = user.postedPlaylists
      var newPlaylistList = userPlaylists.filter((id) => !(id==playlistObjectID))
      var userQuery = { _id: user._id }
      var userUpdatedValues = {
        userName: user.userName,
        password: user.password,
        email: user.email,
        fullName: user.fullName,
        image:user.image,
        postedSongs: user.postedSongs,
        postedPlaylists: newPlaylistList,
      }
      await User.findOneAndUpdate(userQuery, userUpdatedValues)
      return res.status(200).send(deletedPlaylist)
    } else {
      return res.status(400).send({});
    }
  } else {
    return res.status(400).send({});
  }
});


//================================== COMMENT ENDPOINTS ==============================================
//===================================================================================================


//POST a new comment to a song
//http://localhost:4002/api/v2/endPoints/new/comment/:audioid
router.post("/new/comment/:audioid", async(req,res)=>{
    const audioid = req.params.audioid
    const audioObjectId = ObjectID(audioid)
    const audio = await Audio.findById(audioObjectId)
    if(audio){
        const newComment = new Comment(req.body)
        var audioComments = audio.comments
        audioComments.unshift(newComment._id)
        var audioQuery = {_id:audio._id}
        var audioUpdatedValues = {
            name: audio.name,
            key: audio.key,
            likes: audio.likes,
            userId: audio.userID,
            image: audio.image,
            bucket: audio.bucket,
            location: audio.location,
            comments: audioComments
        }
        await Audio.findOneAndUpdate(audioQuery, audioUpdatedValues)
        newComment.save().catch((err) => console.log(err));
        return res.status(200).send(newUser);
    }else{
        return res.status(audio)
    }
})












module.exports = router;
