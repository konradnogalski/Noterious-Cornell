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

  var note = new Note({
    title: "Juri Gagarin of a note. The first one send using EJS markup",
    keywords: "First",
    notes: "EJS = Embedded JavaScript templating",
    summary: "First ever sent using EJS. Wowowowowow!"
  });

  var note2 = new Note({
    title: "Second for ever",
    keywords: "Second",
    notes: "Trying to send notes array to previewPage",
    summary: "Two notes better than one note!"
  });

  var note3 = new Note({
    title: "Third for the win",
    keywords: "Third",
    notes: "Creating table rows based on passed list dynamically!",
    summary: "Embedding javascript code on Preview Page to create table rows dynamically based on passed notes!"
  });

  var notes = [note, note2, note3];

  res.render("previewpage", {notes: notes});
})

app.get("/addnote", function(req, res)
{
  res.sendFile("/addnotepage.html", {root: __dirname} , function(err){
    if (err) {
      return console.error(err);
    }
  });
});

app.post("/addnote", function(req, res)
{
  var noteToAdd = new Note({
    title: req.body.title,
    keywords: req.body.keywords,
    notes: req.body.notes,
    summary: req.body.summary
  });

  noteToAdd.save(function(err, addedNote){
    if (err) return console.error(err);
    res.send("Note was added successfully!");
  })
})

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
