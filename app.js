const express = require("express");
const app = express(); //konwencja - reprezentuje moduł Express

app.use(express.static("public"));

app.get("/", function(req, res)
{
  res.sendFile("/addnotepage.html", {root: __dirname} , function(err){
    if (err) {
      return console.error(err);
    }
  });
});

app.listen(3000, function(){
  console.log("Server is running on port 3000");
});
