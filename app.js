require('dotenv').config();
const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
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

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);

var userSchema = Schema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  created: {type: Date, default: Date.now()},
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});
userSchema.plugin(findOrCreate);
var User = mongoose.model("User", userSchema);

passport.use(new LocalStrategy(
  async function(username, password, done) {
    User.findOne({ username: username }, async function (err, user){

      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' }); //delete last param
      }
      if ( !(await bcrypt.compare(password, user.password))) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id, username: profile.displayName }, function (err, user) {
      return cb(err, user);
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
  userid: String
});

noteSchema.index({title: 'text', keywords: 'text', notes: 'text', summary: 'text'});
Note = mongoose.model("Note", noteSchema); //compiling schema into Model (class that constructs documents).

// --- Register route ---
app.route("/register")
  .get(function(req, res){
    res.render("login", {type: "register", error: ""});
}).post(function(req, res){
  const {username, password} = req.body;

  User.findOne({username: username}, function(err, user){
    if (err) { return console.log(err); }
    if (user) { return res.render("login", {type: "register", error: "true"}) }

    bcrypt.hash(password, parseInt(process.env.salt_rounds), function(err, hash) {
      if (err) return console.log(err);

      var userToAdd = new User({
        username: username,
        password: hash,
      });

      userToAdd.save(function(err, addedUser){
        if (err) return console.error(err);
        return res.redirect("/login")
      });
    });
  });
});

// --- Login route ---
app.get("/",
  isUserAuthenticated,
  function(req, res){
    res.redirect("/home");
  });

app.route("/login")
  .all(isUserAuthenticated)
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

// --- Google login ---
app.get("/auth/google",
  passport.authenticate('google', { scope: ['profile'] }));

app.get("/auth/google/callback",
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
      res.redirect('/home');
  });

// ---  Home route  ---
app.get("/home",
isUserAuthenticated,
function(req, res){
  Note.find({ userid: req.user._id}, function(err, notes) {
    if (err) return console.error(err);
    res.render("notesbrowser", { notes: notes, username: req.user.username });
  });
});

// ---  Add note route ---
app.route("/addnote")
  .all(isUserAuthenticated)
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
      userid: req.user._id
    });

    noteToAdd.save(function(err, addedNote){
      if (err) return console.error(err);
      res.redirect("/home");
    })
  });

// --- Edit note route ---
app.route("/editnote/:noteid")
  .all(isUserAuthenticated, isNoteOwner)
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
      }
    );
    res.redirect("/home");
  });

// --- Delete note route ---
app.post("/deleteNote/:noteid",
  isUserAuthenticated,
  isNoteOwner,
  function(req, res){
    Note.deleteOne({_id: req.params.noteid}, function(err){
      if (err) return console.error(err);
      res.redirect("/home");
    });
});

// --- Get notes route ---
app.get("/notes",
isUserAuthenticated,
function(req, res){
    const {"search-title": title} = req.query; //deconstructing

    Note.find({ $and: [{ userid: req.user._id }, { $text: { $search: title } }] }, function(err, notes){
      res.render("notesbrowser", {notes: notes, username: req.user.username});
    });
});

/// --- logut route ---
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

///--- Examples route ---
app.get('/examples', function(req, res){
  res.render("examples")
})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function(){
  console.log("Server is running on port ${port}");
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

function isNoteOwner(req, res, next){
  console.log(req.params.noteid);
    Note.findOne({_id: req.params.noteid}, function(err, note){
      if (err) return console.error(err);
      if (!req.user._id.equals(note.userid)){
        console.log(typeof(note.userid) + " " + typeof(req.user._id));
        return res.send("Permission denied!");
      }
      return next();
    });
}
