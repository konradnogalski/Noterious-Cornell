const express = require("express");
const app = express(); //konwencja - reprezentuje moduł Express

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true}));

app.get("/", function(req, res)
{
  res.sendFile("/addnotepage.html", {root: __dirname} , function(err){
    if (err) {
      return console.error(err);
    }
  });
});

app.post("/addnote", function(req, res)
{
  var sentFields = "Title: " + req.body.title + "; Keywords: " + req.body.keywords + "; Notes: " + req.body.notes + "; Summary: " + req.body.summary;
  res.send(sentFields);
})

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
