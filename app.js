//jshint esversion:6

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

const time = new Date();

const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

let day = days[time.getDay()];

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

let month = months[time.getMonth()];

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
  }
  
let h = addZero(time.getHours());
let m = addZero(time.getMinutes());
let hours = h + ":" + m ;

const currentTime = `${hours} | ${day}, ${time.getDate()} ${month} ${time.getFullYear()}`;

mongoose.connect("mongodb+srv://pkl_telkom:qwerty-123@cluster0.xv8lg9r.mongodb.net/pkl_telkom", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("login");
});


app.post("/", function(req, res){

    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username}, function(err, foundUser){
        if(err){
            res.send("Salah Username");
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.redirect("/me");
                }
            }else{
                res.send("Salah Password")
            }
        }
    })


});

app.get("/me/:meSubMenu", function(req, res){
    const subMenu = _.startCase(req.params.meSubMenu);
    res.render("me.ejs", {currentTime: currentTime, subdivisi: subMenu});
});

// app.get("/me/logactivity", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Log Activity & Event"});
// });

// app.get("/me/solar", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Solar"});
// });

// app.get("/me/trafo", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Trafo"});
// });

// app.get("/me/pln", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Perusahaan Listrik Negara (PLN)"});
// });

// app.get("/me/cubicle", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Cubicle"});
// });

// app.get("/me/crane", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Crane"});
// });

// app.get("/me/lvmdp", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "LVMDP"});
// });

// app.get("/me/pdam", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "PDAM"});
// });

// app.get("/me/genset", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Genset"});
// });

// app.get("/me/s&h", function(req, res){
//     res.render("me.ejs", {currentTime: currentTime, subdivisi: "Suhu and Humidity"});
// });

// // Security

app.get("/security/:meSubMenu", function(req, res){
    const subMenu = _.startCase(req.params.meSubMenu);
    res.render("security.ejs", {currentTime: currentTime, subdivisi: subMenu});
});

// app.get("/security/sec", function(req, res){
//     res.render("security.ejs", {currentTime: currentTime, subdivisi: "SEC"});
// });

// app.get("/security/btv", function(req, res){
//     res.render("security.ejs", {currentTime: currentTime, subdivisi: "Buku Tamu Vendor"});
// });




app.listen(3000, function(){
    console.log("Server started in port 3000")
});

