attachEventHandlers();

function attachEventHandlers() {
  attachNoteRowListeners();
  attachEditButtonOnClickEventHandler();
  attachClearButtonOnClickEventHandler();
}

function attachNoteRowListeners() {
  const noteRows = $("tbody > tr");

  noteRows.on("mouseenter mouseleave", function(event) {

    var wasMouseEnterEventRelatedTargetRemovedFromDOM = $(document).find(event.relatedTarget).length === 0;
    if (event.type === "mouseenter" && wasMouseEnterEventRelatedTargetRemovedFromDOM){
      //do not trigger event
      return;
    }

    toggleHighlight(this);
    toggleActionButtonsVisiblity(this);
  });

  noteRows.find("p.show-more").click(function() {
    const parentRowElement = $(this).parent().parent();
    showMore(parentRowElement);
  });

  noteRows.find("p.show-less").click(function() {
    const parentRowElement = $(this).parent().parent();
    showLess(parentRowElement);
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
    window.location.href = "http://localhost:3000";
  })
}

function toggleHighlight(noteRow) {
  $(noteRow).toggleClass("table-info");
}

function toggleActionButtonsVisiblity(noteRow) {
  $(noteRow).find(".btn").toggleClass("invisible");
}

function showMore(tableRow) {
  // if (!shouldShowMore(tableRow)) {
  //   return;
  // }

  getNoteUsingAjaxCall(tableRow, function(response) {
    const tbody = $(tableRow).parent();
    const maxKeywordCount = tbody.attr("max-keywords");
    const maxParagraphCount = tbody.attr("max-paragraphs");

    var keywordsCell = $(tableRow).find("td:nth-child(2)");
    var notesCell = $(tableRow).find("td:nth-child(3)")

    if (keywordsCell[0].childElementCount > maxKeywordCount){
      keywordsCell.empty();
      response.keywords.split(/\r\n/).forEach(element => {
        keywordsCell
          .append("<p class='mb-1 text-uppercase text-monospace'>" + element + "</p>");
        });
      keywordsCell.append("<p class='font-italic show-less'>Click to show less...</p>");
    }

    if (notesCell[0].childElementCount > maxParagraphCount){

      notesCell.empty()
      response.notes.split(/\r\n/).forEach(element => {
        notesCell
          .append("<p class='mb-1'>" + element + "</p");
        });
      notesCell.append("<p class='font-italic show-less'>Click to show less...</p>");
    }

    $(tableRow).find("p.show-less").click(function() {
      const parentRowElement = $(this).parent().parent();
      showLess(parentRowElement);
    });
  });
}

function showLess(tableRow) {
  const tbody = $(tableRow).parent();
  const maxKeywordCount = tbody.attr("max-keywords");
  const maxParagraphCount = tbody.attr("max-paragraphs");

  const keywordsCell = $(tableRow).find("td:nth-child(2)");
  const notesCell = $(tableRow).find("td:nth-child(3)")

  if (keywordsCell[0].childElementCount > maxKeywordCount){
    for(let i=keywordsCell[0].childElementCount - 1; keywordsCell[0].childElementCount > maxKeywordCount; i++){
      keywordsCell[0].childNodes[keywordsCell[0].childElementCount - 1].remove();
    }
    keywordsCell.append("<p class='font-italic show-more'>Click to show more...</p>");
  }

  if (notesCell[0].childElementCount > maxParagraphCount){
    for(let i=notesCell[0].childElementCount - 1; notesCell[0].childElementCount > maxKeywordCount; i++){
      notesCell[0].childNodes[notesCell[0].childElementCount - 1].remove();
    }
    notesCell.append('<p class="font-italic show-more">Click to show more...</p>');
  };

  tableRow.find("p.show-more").click(function() {
    const parentRowElement = $(this).parent().parent();
    showMore(parentRowElement);
  });
}

function editNote(noteRow) {
  const noteId = getNoteId(noteRow);
  window.location.href = "http://localhost:3000/editnote/" + noteId;
}

function getNoteUsingAjaxCall(noteRow, onSuccess) {
  $.ajax({
    url: "http://localhost:3000/notes/" + getNoteId(noteRow),
    success: function(response) {
      onSuccess(response);
    }
  });
}

function isHeaderRow(tableRow) {
  return typeof $(tableRow).attr("noteid") === "undefined";
}

function shouldShowMore(noteRow) {
  return $(noteRow).attr("showMore") === "true";
}

function getNoteId(noteRow) {
  return $(noteRow).attr("noteid");
}
