function highlight(obj){
  $(obj).addClass("table-info");
}

function highlightOff(obj){
  $(obj).removeClass("table-info");
}

function editNote(note){
  const noteId = $(note).attr("noteid");
  window.location.href = "http://localhost:3000/editnote/" + noteId;
}
