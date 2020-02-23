const express = require("express");
const app = express(); //convention - represents Express module.
const mongoose = require("mongoose");
const ejs = require("ejs");

mongoose.connect("mongodb://localhost:27017/cornellnotes", {useNewUrlParser: true, useUnifiedTopology: true});

var noteSchema = new mongoose.Schema({
  title: String,
  keywords: String,
  notes: String,
  summary: String,
  created: Date,
  modified: Date
});

var Note = mongoose.model("Note", noteSchema) //compiling schema into Model (class that constructs documents).

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

app.get("/", function(req, res){
  Note.find(function(err, notes) {
    if (err) return console.error(err);
    res.render("notesbrowser", {notes: notes});
  });
})

app.route("/addnote")
  .get(function(req, res) {
    return res.render("addeditnote", {route: "/addnote", note: {}});
  })
  .post(function(req, res) {
    var noteToAdd = new Note({
      title: req.body.title,
      keywords: req.body.keywords,
      notes: req.body.notes,
      summary: req.body.summary
    });

    noteToAdd.save(function(err, addedNote){
      if (err) return console.error(err);
      res.redirect("/");
    })
  });

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

      res.redirect("/");
    });

    app.post("/deleteNote/:noteid", function(req, res){
      console.log("Trying to delete note: " + req.params.noteId);

      Note.deleteOne({_id: req.params.noteid}, function(err){
        if (err) return console.error(err);
      });

      res.redirect("/");
    });

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
