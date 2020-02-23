$("tr").mouseenter(function(){
  highlight(this);
}).mouseout(function(){
  removeHighlight(this);
}).dblclick(function(){
  editNote(this);
});

function highlight(tableRow){
    $(tableRow).addClass("table-info");
}

function removeHighlight(tableRow){
    $(tableRow).removeClass("table-info");
}

function editNote(note){
  const noteId = $(note).attr("noteid");
  window.location.href = "http://localhost:3000/editnote/" + noteId;
}