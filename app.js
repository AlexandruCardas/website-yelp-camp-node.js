import express from 'express';

const app = express();
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import LocalStrategy from 'passport-local';
import flash from 'connect-flash';
import User from './models/user';
import session from 'express-session';
import seedDB from './seeds';
import methodOverride from 'method-override';
// configure dotenv
require("dotenv").config();

//requiring routes
const commentRoutes = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes = require("./routes/index");

// assign mongoose promise library and connect to database
mongoose.Promise = global.Promise;

const databaseUri = process.env.MONGODB_URI || "mongodb://172.17.0.2:27017/YelpCamp?authSource=admin";

// mongoose.connect(databaseUri, {user: "calexc95", pass: "MyMongo1995!?", useNewUrlParser: true})
mongoose.connect(databaseUri, {useNewUrlParser: true})
    .then(() => console.log(`Database connected`))
    .catch(err => console.log(`Database connection error: ${err.message}`));

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(cookieParser("secret"));
//require moment
app.locals.moment = require("moment");
// seedDB(); //seed the database

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});


app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("The YelpCamp Server Has Started!");
});