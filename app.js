require('dotenv').config();

const express = require("express");
const app = express(); //convention - represents Express module.
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require('mongoose-encryption');
const bcrypt = require('bcrypt');

mongoose.connect("mongodb://localhost:27017/cornellnotes", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useCreateIndex', true);
var loggedUser = null;

var userSchema = Schema = new mongoose.Schema({
  email: String,
  password: String,
  created: {type: Date, default: Date.now()},
});

userSchema.plugin(encrypt, {secret: process.env.secret, encryptedFields: ['password']}, );
var User = mongoose.model("User", userSchema);

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

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

// --- Login route ---
app.get("/", function(req, res){
  res.redirect("/login");
})

app.route("/login")
  .get(function(req, res){
    res.render("login", {type: "login", error: "" });
}).post(async function(req, res){
    const {email, password} = req.body;
    User.findOne({email: email}, async function(err, user){
      if (err) { return console.error(err); }

      if(await isSuccessfulyAuthenticated(user, password)){
          loggedUser = user;
          return res.redirect("/home");
      }

      res.render("login", {type: "login", error: "true" })
    });
});

// --- Register route ---
app.route("/register")
  .get(function(req, res){
    res.render("login", {type: "register", error: ""});
}).post(function(req, res){
  const {email, password} = req.body;

  User.findOne({email: email}, function(err, user){
    if (err) return console.error(err);

    if (user) {
        res.render("login", {type: "register", error: "true"});
    } else {
      bcrypt.hash(password, parseInt(process.env.salt_rounds, 10), function(err, hash){
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
    }
  });
})

// ---  Home route  ---
app.route("/home")
  .all(restrict)
  .get(function(req, res){
    Note.find({ user: loggedUser._id} ,function(err, notes) {
      if (err) return console.error(err);
      res.render("notesbrowser", { notes: notes, email: loggedUser.email });
    });
})

// ---  Add note route ---
app.route("/addnote")
  .all(restrict)
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
      user: loggedUser._id
    });

    noteToAdd.save(function(err, addedNote){
      if (err) return console.error(err);
      res.redirect("/home");
    })
  });

// --- Edit note route ---
app.route("/editnote/:noteid")
  .all(restrict)
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
  .all(restrict)
  .post(function(req, res){

    Note.deleteOne({_id: req.params.noteid}, function(err){
      if (err) return console.error(err);
      res.redirect("/home");
    });
});

app.route("/notes")
  .all(restrict)
  .get(function(req, res){
    const {"search-title": title} = req.query; //deconstructing

    Note.find({$text: { $search: title}}, function(err, notes){
      console.log(title + "\r\n" + notes);

      res.render("notesbrowser", {notes: notes, email: loggedUser.email});
    });
});

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});

function restrict(req, res, next){
  if(loggedUser != null){
    next();
  } else {
    res.send("<p>You need to sign in first</p>")
  }
}

async function isSuccessfulyAuthenticated(user, receivedPassword){
  let isSuccessfulyAuthenticated = false;
  if(user) {
    isSuccessfulyAuthenticated = await bcrypt.compare(receivedPassword, user.password);
  }
  return isSuccessfulyAuthenticated;
}
