const express = require('express');
const Game = require('../models/games');
const router = express.Router()
const multer = require('multer');
require('dotenv').config();

const storage = multer.diskStorage({
    destination:function(req, file, cb) {
        cb(null, "./public/images/games")
    },
    filename:function(req, file, cb){
        cb(null, Date.now() + ".jpg")
    }
})

const upload = multer({
    storage:storage
})

router.get("/", (req, res) => {
    Game.find().exec()
    .then((doc) => {
        res.render("index", {game:doc})
    })
    .catch((err) => {
        console.error("Error fetching games:", err);
        res.status(500).send("Error retrieving games");
    });
})

router.get("/game/:id", (req, res) => {
    let id = req.params.id
    Game.findById(id).exec()
    .then((doc) => {
        res.render("gamePreview", {game:doc})
    })
    .catch((err) => {
        console.error("Error fetching game:", err);
        res.status(500).send("Error retrieving game");
    });
})

router.get("/category/:id", (req, res) => {
    let category = req.params.id

    if(category === "OpenWorld") category = "Open World"
    if(category === "singleplayer") category = "Single Player"

    Game.find({ categories: { $in: [category] } }).exec()
    .then((doc) => {
        res.render("category", {game:doc, category:category})
    })
    .catch((err) => {
        console.error("Error fetching games:", err);
        res.status(500).send("Error retrieving games");
    });
})

router.get("/addGame", (req, res) => {
    if(req.session.login){
        res.render("addGame")
    }
    else{
        res.render("login")
    }
})

router.get("/manage", (req, res) => {
    if(req.session.login){
        Game.find().exec()
        .then((doc) => {
            res.render("manage", {game: doc})
        })
        .catch((err) => {
            console.error(err);
            res.status(500)
            res.render("404")
        })
    }
    else{
        res.render("login")
    }
})

router.get("/delete/:id", (req, res) => {
    let id = req.params.id
    Game.findByIdAndDelete(id, {useFindAndModify:false}).exec()        
    .then(() => {
        res.redirect("/manage")
    })
    .catch((err) => {
        console.error(err);
        res.status(500)
    });
})

router.post("/edit", (req, res) => {
    const edit_id = req.body.edit_id
    Game.findById(edit_id).exec()
    .then((doc) => {
        res.render("edit", {game:doc})
    })
    .catch((err) => {
        console.error(err);
    })
})

router.post("/update", (req, res) => {
    const update_id = req.body.update_id
    const { name, price, description, developer, categories } = req.body

    let data = {
        name:name,
        price:price,
        description:description,
        developer:developer,
        categories:categories
    }

    Game.findByIdAndUpdate(update_id, data, {useFindAndModify:false}).exec()
    .then(() => {
        res.redirect("/manage")
    })
    .catch((err) => {
        console.error(err);
    });
})

router.post("/insert", upload.single("image"), (req, res) => {
    const { name, price, description, developer, categories } = req.body;

    const developerArray = developer.split(',').map(dev => dev.trim());
    const categoriesArray = categories.split(',').map(cat => cat.trim());
    let data = new Game({
        name:name,
        price:price,
        image:req.file.filename,
        description:description,
        developer: developerArray,
        categories: categoriesArray
    })
    Game.saveGame(data)
    .then(() => {
        res.redirect("/");
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send("Error saving game");
    });
})

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        res.redirect("/")
    })
    
})

router.post("/login", (req, res) => {

    const {username, password} = req.body

    const admin = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const timeExpire = 3600000

    if(username === admin && password === adminPassword){
        req.session.username = username
        req.session.password = password
        req.session.login = true
        req.session.cookie.maxAge = timeExpire
        res.redirect("addGame")
    }
    else{
        res.render("404")
    }
})

module.exports = router