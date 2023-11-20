

const server = "http://127.0.0.1";


/** Uses input values to try to log in with given type, username, and password */
function attemptLogin(){
    let loginForm = document.getElementById("loginForm");
    let userTypeSelect = document.getElementById("userType");
    let usernameBox = document.getElementById("username");
    let passwordBox = document.getElementById("password");
    if (usernameBox.value == "" || passwordBox.value == ""){
        alert("Please fill in required fields");
        return;
    }
    
    let url = server + "/login/";
    console.log(url);
    let request = fetch(url, {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            username: usernameBox.value,
            password: passwordBox.value,
            type: userTypeSelect.value
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

function addStudentAccount(){
    let usernameBox = document.getElementById("newUsername");
    let passwordBox = document.getElementById("newPassword");
    let emailBox = document.getElementById("newEmail");
    if (usernameBox.value == "" || passwordBox.value == "" || emailBox.value == ""){
        alert("Please fill in required fields");
        return;
    }
    let url = server + "/add/student/";
    let request = fetch(url, {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            name: usernameBox.value,
            password: passwordBox.value,
            email: emailBox.value
        })
    })
    request.then((result) =>{
        window.location.href = "login.html";
    })
    request.catch((error) =>{
        console.log(error);
    });
}