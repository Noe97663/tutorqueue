
window.onload = (() => {
    //document.cookie = username + "=" +
    //  "expires=Thu, 01 Jan 1970 00:00:01 GMT";
    studentCreate = document.getElementById("createAccountForm");
    studentCreate.addEventListener("submit", addStudentAccount);
});

/** Uses input values to try to log in with given type, username, and password */
function attemptLogin(){
    let loginForm = document.getElementById("loginForm");
    let usernameBox = document.getElementById("username");
    let passwordBox = document.getElementById("password");
    if (usernameBox.value == "" || passwordBox.value == ""){
        alert("Please fill in required fields");
        return;
    }
    
    let request = fetch("/login/", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            username: usernameBox.value,
            password: passwordBox.value
        })
    });

    request.then((response)=>{
        if (response.status == 500){
            loginForm.reset();
            alert("Incorrect Username and/or Password");
        }
        else{
            let page =  response.text();
            page.then((path) => {
                window.location.href = path;});
        }
    })
    request.catch((error) =>{
        console.log(error);
    })
}

function createStudentPage(){
    window.location.href = 'studentCreate.html';
}

function addStudentAccount(e){
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
            usernameBox.value = "";
            let message = document.getElementById("failMessage");
            message.innerText = "Username already exists. Please try a different Username."
        } else {
        window.location.href = "login.html";
        }
    })
    request.catch((error) =>{
        console.log(error);
    });
}