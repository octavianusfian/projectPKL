//jshint esversion:6

import express from "express";
import mongoose from "mongoose";
import ejs from "ejs";
import bodyParser from "body-parser";
import _ from "lodash";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import fs from "fs";
import { google } from "googleapis";
import session from 'express-session';
import passport  from "passport";
import passportLocalMongoose from "passport-local-mongoose";
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


const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// Data


app.get("/", function(req, res){
    res.render("login");
});


app.post("/", function(req, res){
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    
        req.login(user, function(err) {
        
            if (err) { return res.render("wrongPassword.ejs"); }
            return res.redirect('/dashboard');
          });
 


    
});

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });



app.get("/dashboard", async function(req, res){
    if(req.isAuthenticated()){
        
        // --------------------- ME ------------------------
        let titleSheetsME = [];
        

        const doc = new GoogleSpreadsheet('18EULY4UqHcN8V9uiagp3yjPpVh67pzlHquDObx3YTr8');

        const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
        await doc.useServiceAccountAuth({
            // env var values are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key,
        });
            
        // loads document properties and worksheets
        await doc.loadInfo(); 

        for(let i=0; i<doc.sheetsByIndex.length;i++){
            titleSheetsME.push(doc.sheetsByIndex[i].title);
        }

        let sheet = doc.sheetsByIndex[0];

        // create rows

        const rows = await sheet.getRows({
            offset: -1,
        });
    
        const headerValues = sheet.headerValues;
        
        let current_page = 1;
        let rows_per_page = 6;
        
    
        let start = (rows_per_page * (current_page-1));
        let end = start + rows_per_page;
        
    
        const paginatedRows = await sheet.getRows({
            offset: start,
            limit: rows_per_page
            });


        //-------------------
        
        // --------------- Security --------------
        let titleSheetsSecurity = [];
        

        const doc2 = new GoogleSpreadsheet('1LyaobzyN3zB4alg7sIG6Cd-8itGh7SztZ9mhTmQohMo');

        const CREDENTIALS2 = JSON.parse(fs.readFileSync('credentials.json'));
        await doc2.useServiceAccountAuth({
            // env var values are copied from service account credentials generated by google
            // see "Authentication" section in docs for more info
            client_email: CREDENTIALS2.client_email,
            private_key: CREDENTIALS2.private_key,
        });
            
        // loads document properties and worksheets
        await doc2.loadInfo(); 

        for(let i=0; i<doc2.sheetsByIndex.length;i++){
            titleSheetsSecurity.push(doc2.sheetsByIndex[i].title);
        }

        let sheet2 = doc2.sheetsByIndex[0];

        // create rows

        const rows2 = await sheet2.getRows({
            offset: -1,
        });
    
        const headerValues2 = sheet2.headerValues;
        
        let current_page2 = 1;
        let rows_per_page2 = 6;
        
    
        let start2 = (rows_per_page * (current_page-1));
        let end2 = start + rows_per_page;
        
    
        const paginatedRows2 = await sheet2.getRows({
            offset: start2,
            limit: rows_per_page2
            });
        
        // ------------------------------------



            
    
    
        
        res.render("dashboard_new.ejs", {currentTime: currentTime, items: rows, items2: rows2, paginatedItems: paginatedRows,paginatedItems2: paginatedRows2, current_page, headerValues, headerValues2, titleSheetsME, titleSheetsSecurity}); 

        
    }else{
        res.render("wrongPassword.ejs");
    }
    
});

app.get("/me/:meSubMenu", async function(req, res){
    const subMenu = _.startCase(req.params.meSubMenu);
    const current_page = req.query.page || 1;

    
    const doc = new GoogleSpreadsheet('18EULY4UqHcN8V9uiagp3yjPpVh67pzlHquDObx3YTr8');

    const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
    await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key,
    });
        
    // loads document properties and worksheets
     await doc.loadInfo(); 

    let sheet;


    switch (subMenu) {
        case "Harian LVMDP":
            sheet = doc.sheetsByIndex[0];
            break;
        case "Cubicle":
            sheet = doc.sheetsByIndex[1];
            break;
        case "Harian PLN":
            sheet = doc.sheetsByIndex[2];
            break;
        case "Log Activities ME":
            sheet = doc.sheetsByIndex[3];
            break;
        case "PDAM":
            sheet = doc.sheetsByIndex[4];
            break;
        case "PDU LT5":
            sheet = doc.sheetsByIndex[5];
            break;
        case "BRect 67":
            sheet = doc.sheetsByIndex[6];
            break;
        case "Rect LT9":
            sheet = doc.sheetsByIndex[7];
            break;
        case "UPS IO LT8":
            sheet = doc.sheetsByIndex[8];
            break;
        case "UPS IO LT5":
            sheet = doc.sheetsByIndex[9];
            break;
        case "Trafo":
            sheet = doc.sheetsByIndex[10];
            break;
        case "Temperature & Humidity PAC":
            sheet = doc.sheetsByIndex[11];
            break;
        case "Solar":
            sheet = doc.sheetsByIndex[12];
                    break;
        default:
            sheet = doc.sheetsByIndex[0];

            
    }

        
    // let sheet = doc.sheetsByIndex[0];

    
    
    

    // read rows

    const rows = await sheet.getRows({
        offset: -1,
    });

    const headerValues = sheet.headerValues;
    

    let rows_per_page = 6;
    

    let start = (rows_per_page * (current_page-1));
    let end = start + rows_per_page;
    

    const paginatedRows = await sheet.getRows({
        offset: start,
        limit: rows_per_page
        });


    
    res.render("me.ejs", {currentTime: currentTime, subdivisi: subMenu, items: rows, paginatedItems: paginatedRows, current_page, headerValues});   
});


// // Security
 
app.get("/security/:meSubMenu", async function(req, res){
    const subMenu = _.startCase(req.params.meSubMenu);
    const current_page = req.query.page || 1;

    const doc = new GoogleSpreadsheet('1LyaobzyN3zB4alg7sIG6Cd-8itGh7SztZ9mhTmQohMo');

    const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
    await doc.useServiceAccountAuth({
        // env var values are copied from service account credentials generated by google
        // see "Authentication" section in docs for more info
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key,
    });
        
    // loads document properties and worksheets
    await doc.loadInfo(); 

    let sheet;


    switch (subMenu) {
        case "Stagging Room":
            sheet = doc.sheetsByIndex[0];
            break;
        case "Kontrol Gedung":
            sheet = doc.sheetsByIndex[1];
            break;
        case "KM Barang":
            sheet = doc.sheetsByIndex[2];
            break;
        case "Kebersihan Pekerjaan Vendor":
            sheet = doc.sheetsByIndex[3];
            break;
        case "Checklist CCTV NVR 1":
            sheet = doc.sheetsByIndex[4];
            break;
        case "Checklist CCTV NVR 2":
            sheet = doc.sheetsByIndex[5];
            break;
        case "Buku Mutasi Jaga":
            sheet = doc.sheetsByIndex[6];
            break;
        case "Buku Checklist Kendaraan":
            sheet = doc.sheetsByIndex[7];
            break;
        default:
            res.render("notFound.ejs");

            
    }

        

    
    
    

    // read rows

    const rows = await sheet.getRows({
        offset: -1,
    });

    const headerValues = sheet.headerValues;
    

    let rows_per_page = 6;
    

    let start = (rows_per_page * (current_page-1));
    let end = start + rows_per_page;
    

    const paginatedRows = await sheet.getRows({
        offset: start,
        limit: rows_per_page
        });


    
    res.render("security.ejs", {currentTime: currentTime, subdivisi: subMenu, items: rows, paginatedItems: paginatedRows, current_page, headerValues});   
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









