const mongoose = require('mongoose');
require('dotenv').config();

const dbURL = process.env.DB_URL

mongoose.connect(dbURL, {
    serverSelectionTimeoutMS: 30000,
})
.then(() => {
    console.log("Database connected successfully!");
})
.catch((err) => {
    console.error("Database connection error:", err);
})

let gameSchema = mongoose.Schema({
    name:String,
    price:Number,
    image: String,
    description: String,
    developer:[String],
    categories:[String]
})

let Game = mongoose.model("Game", gameSchema)

module.exports = Game

module.exports.saveGame = (data) => {
    const game = new Game(data)
    return game.save()
    .then(() => {
        console.log("Game saved successfully!")
    })
    .catch((err) => {
        console.error("Error saving game:", err);
    })
}