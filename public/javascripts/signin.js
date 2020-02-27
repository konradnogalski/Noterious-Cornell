$("input[type='password']").on("keyup", doesPasswordMatch);

function doesPasswordMatch(){
    if($("#inputPasswordConfirm").val() === $("#inputPassword").val()){
        $("#inputPasswordConfirm").removeClass("is-invalid").addClass("is-valid");
    } else {
        $("#inputPasswordConfirm").addClass("is-invalid").removeClass("is-valid");
    }
  }
