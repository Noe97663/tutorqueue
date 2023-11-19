const server = "http://164.92.64.123"

function postItem() {
    let title = document.getElementById("title").value;
    let desc = document.getElementById("desc").value;
    let price = document.getElementById("price").value;
    let status = document.getElementById("status").value;
    let user = decodeURIComponent(document.cookie).split("\"")[3];
    let imgInput = document.getElementById("img");
    let img = imgInput.files[0];
  
    // set url
    let url = server + '/add/item/' + user + '/';
  
    // prepare data using FormData
    let formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('price', price);
    formData.append('itemStatus', status);
    formData.append('user', user);
    formData.append('image', img);
  
    let p = fetch(url, {
      method: 'POST',
      body: formData,
    });
  
    p.then((response) => {
      return response.text();
    }).then((text) => {
      console.log(text);
      window.location.href = "/home.html"
    }).catch((error) => {
      console.log(error);
    });
    
  }
  


postButton = document.getElementById("post_item")
postButton.onclick = postItem