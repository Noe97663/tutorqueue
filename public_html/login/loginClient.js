/**
Authors: Joseph Cortez
         Kyle Walker
         Noel Poothokaran
         Skyler DeVaughn
Course: Csc 337 Webdev Benjamin Dicken Fall 2023
Purpose: This is the client script for logging in, which handles login form submission and create account requests.
        login makes a request to the server to authenticate with te given credentials, and create account redirects
        to the create account page.
*/

/**
 * When page loads, add event listeners to both login and
 * create account form elements.
 */
window.onload = () => {
  studentCreate = document.getElementById("createAccountForm");
  if (studentCreate != null) {
    studentCreate.addEventListener("submit", addStudentAccount);
  }
  loginForm = document.getElementById("loginForm");
  if (loginForm != null) {
    loginForm.addEventListener("submit", attemptLogin);
  }
};

/** Uses input values to try to log in with given type, username, and password
 * Calls request to server to salt and hash credentials and compare with database,
 * or alerts if invalid combo
 * @param event for button press
 */
function attemptLogin(e) {
  e.preventDefault();
  let usernameBox = document.getElementById("username");
  let passwordBox = document.getElementById("password");

  let request = fetch("/login/", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      username: usernameBox.value,
      password: passwordBox.value,
    }),
  });

  request.then((response) => {
    if (response.status == 500) {
      loginForm.reset();
      alert("Incorrect Username and/or Password");
    } else {
      let page = response.text();
      page.then((path) => {
        window.location.href = path;
      });
    }
  });
  request.catch((error) => {
    console.log(error);
  });
}

/**
 * redirects to the create account page
 */
function createStudentPage() {
  window.location.href = "studentCreate.html";
}

/**
 * Gets values included in form fields and makes server request to create a new account
 * and add to the DB. Gives error alert if user already exists, and requires proper inputs
 * @param {*} e
 */
function addStudentAccount(e) {
  e.preventDefault();
  let usernameBox = document.getElementById("newUsername");
  let passwordBox = document.getElementById("newPassword");
  let emailBox = document.getElementById("newEmail");

    let request = fetch("/add/student/", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            name: usernameBox.value,
            password: passwordBox.value,
            email: emailBox.value
        })
    })
    request.then((result) => {
        if (result.status == 500) {
            alert("Username already taken. Please give a different username.");
        } else if (result.status == 700) {
            alert("An account with that email aleady exists. Try logging in.")
        } else {
        window.location.href = "login.html";
        }
    })
    request.catch((error) =>{
        console.log(error);
    });
}
