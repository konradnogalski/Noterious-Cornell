const maxKeywordsShow = $("tbody").attr("max-keywords");
const maxNotesShow = $("tbody").attr("max-paragraphs");

attachEventHandlers();

function attachEventHandlers() {
  attachNoteRowListeners();
  attachEditButtonOnClickEventHandler();
  attachClearButtonOnClickEventHandler();
}

function attachNoteRowListeners() {
  const noteRows = $("tbody > tr");

  noteRows.click(function() {
    showMore(this);
  });
}

function attachEditButtonOnClickEventHandler() {
  $("button.edit").click(function() {
    const buttonParentRow = $(this).parent().parent();
    editNote(buttonParentRow);
  });
}

function attachClearButtonOnClickEventHandler() {
  $("button.button-clear").click(function() {
    window.location.href = "/home";
  })
}

function showMore(tableRow) {
  const keywords = getNoteKeywords(tableRow);
  const notes = getNoteNotes(tableRow);

  if (keywords.length > maxKeywordsShow){
    keywords.removeClass("d-none");
    keywords.last().text("Click to show less...");
  }

  if (notes.length > maxNotesShow){
    notes.removeClass("d-none");
    notes.last().text("Click to show less...");
  }

  $(tableRow).off().click(function() {
    showLess(this);
  });
}

function showLess(tableRow) {
  const keywords = getNoteKeywords(tableRow);
  const notes = getNoteNotes(tableRow);

  if (keywords.length > maxKeywordsShow){
    keywords.filter(index => index > maxKeywordsShow - 1 && index !== keywords.length - 1).addClass("d-none");
    keywords.last().text("Click to show more...");
  }

  if (notes.length > maxNotesShow){
    notes.filter(index => index > maxNotesShow - 1 && index !== notes.length - 1).addClass("d-none");
    notes.last().text("Click to show more...");
  }

  $(tableRow).off().click(function() {
    showMore(this);
  });
}

function getNoteKeywords(tableRow){
  return getRowCell(tableRow, 2);
}

function getNoteNotes(tableRow){
  return getRowCell(tableRow, 3);
}

function getRowCell(tableRow, columnPosition){
  return $("tr[noteid='" + getNoteId(tableRow) + "'] td:nth-child(" + columnPosition +") p");
}

function editNote(noteRow) {
  const noteId = getNoteId(noteRow);
  window.location.href = "/editnote/" + noteId;
}

function getNoteId(noteRow) {
  return $(noteRow).attr("noteid");
}
