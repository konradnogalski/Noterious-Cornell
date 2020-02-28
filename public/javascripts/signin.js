$("input[type='password']").on("keyup", verifyPasswords);
$("form[action='/register']").on("submit", doPasswordsMatch);

function doPasswordsMatch(){
  return $("#inputPasswordConfirm").val() === $("#inputPassword").val();
}

function verifyPasswords(){
  const arePasswordFieldsEmpty = $("#inputPasswordConfirm").val() === "" && $("#inputPassword").val() === "";
  if (arePasswordFieldsEmpty){
    return;
  }

  if(doPasswordsMatch()){
      $("#inputPasswordConfirm").removeClass("is-invalid").addClass("is-valid");
  } else {
      $("#inputPasswordConfirm").addClass("is-invalid").removeClass("is-valid");
  }
}
