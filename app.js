require('dotenv').config();
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session")
const bcrypt = require("bcrypt");
const encrypt = require('mongoose-encryption');

const app = express(); //convention - represents Express module.

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.SECRET_SESSION,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/cornellnotes", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

var userSchema = Schema = new mongoose.Schema({
  email: String,
  password: String,
  created: {type: Date, default: Date.now()},
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']}, );
var User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(
  { usernameField: "email" },
  async function(email, password, done) {
    User.findOne({ email: email }, async function (err, user){

      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' }); //delete last param
      }
      if (await !bcrypt.compare(password, user.password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done){
  done(null, user._id);
});
passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  })
});

var noteSchema = new mongoose.Schema({
  title: String,
  keywords: String,
  notes: String,
  summary: String,
  created: { type: Date, default: Date.now() },
  modified: Date,
  user: String
});

noteSchema.index({title: 'text', keywords: 'text', notes: 'text', summary: 'text'});
Note = mongoose.model("Note", noteSchema); //compiling schema into Model (class that constructs documents).

// --- Authenticate each request ---
app.use(isUserAuthenticated);

// --- Login route ---
app.get("/", function(req, res){
  res.redirect("/home");
})

app.route("/login")
  .get(function(req, res){
    res.render("login", {type: "login", error: "" });
}).post(function(req, res, next){
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.render('login', {type: "login", error: "true"}); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect("/home");
    });
  })(req, res, next);
});

// --- Register route ---
app.route("/register")
  .get(function(req, res){
    res.render("login", {type: "register", error: ""});
}).post(function(req, res){
  const {email, password} = req.body;

  bcrypt.hash(password, parseInt(process.env.salt_rounds), function(err, hash) {
    if (err) return console.log(err);

    var userToAdd = new User({
      email: email,
      password: hash,
    });

    userToAdd.save(function(err, addedUser){
      if (err) return console.error(err);
      return res.redirect("/login")
    });
  });
});

// ---  Home route  ---
app.get("/home", function(req, res){
  Note.find({ user: req.user._id}, function(err, notes) {
    if (err) return console.error(err);
    res.render("notesbrowser", { notes: notes, email: req.user.email });
  });
})

// ---  Add note route ---
app.route("/addnote")
  // .all(isUserAuthenticated)
  .get(function(req, res) {
    return res.render("addeditnote", {
      route: "/addnote",
      note: {}
    });
  })
  .post(function(req, res) {
    var noteToAdd = new Note({
      title: req.body.title,
      keywords: req.body.keywords,
      notes: req.body.notes,
      summary: req.body.summary,
      user: req.user._id
    });

    noteToAdd.save(function(err, addedNote){
      if (err) return console.error(err);
      res.redirect("/home");
    })
  });

// --- Edit note route ---
app.route("/editnote/:noteid")
  .get(function(req, res){
    Note.findOne({_id: req.params.noteid}, function (err, note){
      if (err) return console.error(err);
      res.render("addeditnote", {route: "/editnote/" + req.params.noteid, note: note});
    });

  })
  .post(function(req, res){
    Note.updateOne(
      { _id: req.params.noteid },
      {
        title: req.body.title,
        keywords: req.body.keywords,
        notes: req.body.notes,
        summary: req.body.summary
      },
      function (err, writeOpResult){
        if (err) return console.error(err);
        console.log(writeOpResult);
      }
    );

    res.redirect("/home");
  });

// --- Delete note route ---
app.route("/deleteNote/:noteid")
  .post(function(req, res){

    Note.deleteOne({_id: req.params.noteid}, function(err){
      if (err) return console.error(err);
      res.redirect("/home");
    });
});

app.route("/notes")
  .get(function(req, res){
    const {"search-title": title} = req.query; //deconstructing

    Note.find({ $and: [{ user: req.user._id }, { $text: { $search: title } }] }, function(err, notes){
      res.render("notesbrowser", {notes: notes, email: req.user.email});
    });
});

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});

function isUserAuthenticated(req, res, next){

    if(req.url === "/login" || req.url === "/register"){
      return next();
    }

    if(req.isAuthenticated()){
     return next();
    }

    res.redirect("/login")
}
