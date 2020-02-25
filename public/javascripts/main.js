$("tr").mouseenter(function(){
  highlight(this);
}).mouseleave(function(){
  removeHighlight(this);
});

$("button.edit").click(function(){
  const buttonParentRow = $(this).parent().parent();
  editNote(buttonParentRow);
});

$("button.button-clear").click(function(){
  window.location.href = "http://localhost:3000";
})

function highlight(tableRow){
  if (!isHeaderRow(tableRow)){
    $(tableRow).addClass("table-info");
    $(tableRow).find(".btn").each(function(){
      $(this).removeClass("invisible");
    });
  };
}

function removeHighlight(tableRow){
  if (!isHeaderRow(tableRow)){
    $(tableRow).removeClass("table-info");
    $(tableRow).find(".btn").each(function(){
      $(this).addClass("invisible");
    });
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
