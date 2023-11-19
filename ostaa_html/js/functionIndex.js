/* 
Noel Martin Poothokaran
CSC 337: PA8 - OSTAA
This js file contains the JavaScript for the Ostaa PA.
This js file contains the scripts for the html page.
The file mainly runs js code whenever buttons are clicked.
It makes use of AJAX requests to ping a server for data.
*/


const server = "http://164.92.64.123"

/*
Description:
This function sends an AJAX request to the server to
add a new user based on the values provided in the
input fields on the page. After adding the user,
it displays an alert and logs the result in the console.

Parameters:
None

Usage:
Call this function when you want to add a new user to 
the server. Ensure that the "user" and "password" input
fields on the page are filled with the user's desired username and password.
*/
function addUser() {
  let username = document.getElementById("add_user").value
  let password = document.getElementById("add_password").value
  //set url
  let url = server + '/add/user/';
  //prepare data
  let info = { username: username, password: password };

  let p = fetch(url, {
    method: 'POST',
    body: JSON.stringify(info),
    headers: { 'Content-Type': 'application/json' }
  });

  p.then((response) => {
    return response.text();
  }).then((text) => {
    let message = document.getElementById("create_msg")
    if(text.startsWith('Failure.')){
      message.innerText = "Username already in use. Try a different username or login."
    }
    else{
      username.value=""
      password.value=""
      message.innerText = "New user created. Please login."
    }
  }).catch((error) => {
    console.log(error)
  });

}

function loginUser(){
  let username = document.getElementById("login_user").value
  let password = document.getElementById("login_password").value
  //set url
  let url = server + '/login/';
  //prepare data
  let info = { username: username, password: password };

  let p = fetch(url, {
    method: 'POST',
    body: JSON.stringify(info),
    headers: { 'Content-Type': 'application/json' }
  });

  p.then((response) => {
    return response.text();
  }).then((text) => {
    let message = document.getElementById("login_msg")
    if(text.startsWith('Failure.')){
      message.innerText = "Login failed. Try again."
    }
    else{
      window.location.href = "/home.html"
    }
  }).catch((error) => {
    console.log(error)
  });
}
/*
Description:
This function sends an AJAX request to the server to add a new
item based on the values provided in the input fields on the page.
After adding the item, it displays an alert and logs the result
in the console.

Parameters:
None

Usage:
Call this function when you want to add a new item to the server.
Ensure that the "title," "desc," "img," "price," "status," and
"item_user" input fields on the page are filled with the item's
details, and the "item_user" field contains the username of the
item's owner.

*/
function addItem() {
  let title = document.getElementById("title").value
  let desc = document.getElementById("desc").value
  let img = document.getElementById("img").value
  let price = document.getElementById("price").value
  let status = document.getElementById("status").value
  let user = document.getElementById("item_user").value
  //set url
  let url = server + '/add/item/' + user + "/";
  //prepare data
  let info = {title: title,description: desc,image: img,
              price: price,itemStatus: status};

  let p = fetch(url, {
    method: 'POST',
    body: JSON.stringify(info),
    headers: { 'Content-Type': 'application/json' }
  });

  p.then((response) => {
    return response.text();
  }).then((text) => {
    console.log(text);
  }).catch((error) => {
    console.log(error)
  });
  alert("item added")

}


//setting button onclicks
document.getElementById("create_user_btn").onclick = addUser;
document.getElementById("login_user_btn").onclick = loginUser;
