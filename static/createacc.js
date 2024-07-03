var form = document.getElementById("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  var formData = new FormData(form);

  fetch("/signup", {
    method: "POST",
    body: formData,
    header: {
      "Content-Type": "multipart/form-data"
    }
  })
  .then((res) => {
    alert("You have created an account successfully")
    
  })

})