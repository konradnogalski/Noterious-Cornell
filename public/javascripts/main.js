$("tr").mouseenter(function(){
  highlight(this);
}).mouseout(function(){
  removeHighlight(this);
}).dblclick(function(){
  editNote(this);
});

function highlight(tableRow){
  if (!isHeaderRow(tableRow)){
    $(tableRow).addClass("table-secondary");
  };
}

function removeHighlight(tableRow){
  if (!isHeaderRow(tableRow)){
    $(tableRow).removeClass("table-secondary");
  }
}

function isHeaderRow(tableRow){
  return typeof $(tableRow).attr("noteid") === "undefined";
}

function editNote(note){
  const noteId = getNoteId(note);
  window.location.href = "http://localhost:3000/editnote/" + noteId;
}

function getNoteId(note){
  return $(note).attr("noteid");
}
