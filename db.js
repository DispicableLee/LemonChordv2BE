const mongoose = require("mongoose");

const URL = "mongodb+srv://rob2453:rob2453@lemoncordv2.zapyn.mongodb.net/LemonCordV2?retryWrites=true&w=majority";

const connectDB = async () =>{
    await mongoose.connect(URL, {
        useUnifiedTopology: true,
        useNewUrlParser: true
    });
    console.log("mongoDB successfully connected");
}; 









module.exports = connectDB;