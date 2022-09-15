//jshint esversion:6

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const _ = require("lodash");
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require("fs");
const { google } = require("googleapis");
const session = require('express-session');
const passport =  require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const { SetupPagination, PaginationButton } = require('./pagination');


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');


app.use(session({
    secret: "this is our secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: false}));

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

// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// passport.deserializeUser(function(user, done) {
//     return done(null, user);
//   });



app.get("/", function(req, res){
    res.render("login");
});


app.post("/", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });


    req.login(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/dashboard');
      });

    // const username = req.body.username;
    // const password = req.body.password;

    // User.findOne({username: username}, function(err, foundUser){
    //     if(err){
    //         res.send("Salah Username");
    //     }else{
    //         if(foundUser){
    //             if(foundUser.password === password){
    //                 res.redirect("/dashboard");
    //             }else{
    //                 res.render("wrongPassword.ejs");}
    //         }else{
    //             res.render("wrongPassword.ejs");
    //         }
    //     }
    // })


});

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });



app.get("/dashboard", function(req, res){
    if(req.isAuthenticated()){
        res.render("dashboard.ejs", {currentTime: currentTime});
    }else{
        res.render("wrongPassword.ejs");
    }
    
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

app.get("/security/:meSubMenu", async function(req, res){

    const {page=1, limit=10} = req.query;

   
    // Google SpreadSheet
    const doc = new GoogleSpreadsheet('13Bbb6tMZRvUxYeiqW_8xLUKCZCswK51bvHJT2Ww6UdQ');

    const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
    await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key,
    });
        
    // loads document properties and worksheets
    await doc.loadInfo(); 

        
    let sheet = doc.sheetsByIndex[0];
    
        
    
        
    // read rows

    const rows = await sheet.getRows({
        offset: -1,
        limit: 15
    
    });


    // Item Pagination

    let current_page = 1;
    let rows_per_page = 5;

    let start = (rows_per_page * (current_page-1));
    // let end = start + rows_per_page;
    // let paginatedItems = items.slice(start,end);

    const paginatedRows = await sheet.getRows({
        offset: start,
        limit: rows_per_page
    
    });

    // ----------------------

    // Pagination Button

    //------------------




    //   ----------------------------------

    const subMenu = _.startCase(req.params.meSubMenu);
    res.render("security.ejs", {currentTime: currentTime, subdivisi: subMenu, items: rows, paginatedItems: paginatedRows});   
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

