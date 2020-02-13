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
    res.render("previewpage", {notes: notes});
  });
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
