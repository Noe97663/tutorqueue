const server = "http://164.92.64.123"

function putUserName() {
    let topText = document.getElementById("user")

    username = decodeURIComponent(document.cookie).split("\"")[3];

    topText.innerText = "Welcome " + username + "! What would you like to do?"


}

function newListing() {
    window.location.href = "/post.html"
}

function sell(itemId, user) {
    console.log("it works")
    console.log(itemId)
    console.log(user)

    let url = server + "/sell/"+itemId+"/"+user+"/"

    console.log(url)

    fetch(url).then((response)=>{

        document.getElementById(itemId).innerHTML = "<div>" + "SOLD" + "</div>"
        console.log(response)
    })

   

}

function listings() {
    username = decodeURIComponent(document.cookie).split("\"")[3];
    let url = server + '/get/listings/' + username;
    fetch(url).then((response) => {
        return response.text();
    }).then((text) => {

        data = JSON.parse(text)
        return data
    }).then((data) => {

        alterRight(data)

    }).catch((error) => {
        console.log(error);
    });
}

function purchases() {
    username = decodeURIComponent(document.cookie).split("\"")[3];
    let url = server + '/get/purchases/' + username;
    fetch(url).then((response) => {
        return response.text();
    }).then((text) => {

        data = JSON.parse(text)
        return data
    }).then((data) => {

        alterRight(data)

    }).catch((error) => {
        console.log(error);
    });
}

function search() {
    keyword = document.getElementById("keyword").value
    let url = server + '/search/items/' + keyword;
    fetch(url).then((response) => {
        return response.text();
    }).then((text) => {

        data = JSON.parse(text)

        const idArray = data.map(item => item._id);

        return idArray
    }).then((data) => {

        alterRight(data)

    }).catch((error) => {
        console.log(error);
    });
}


function alterRight(userData) {

    username = decodeURIComponent(document.cookie).split("\"")[3];
    let url = server + '/get/items/';
    toInsert = ""
    fetch(url).then((response) => {
        return response.text();
    }).then((text) => {

        data = JSON.parse(text)
        return data
    }).then((data) => {

        data.forEach(item => {
            if (userData.includes(item._id.toString())) {
                start = "<div class=\"item\">"
                title = "<div class=title>" + item.title + "</div>"
                image = "<div>" + "<img src=\"/images/" + item.image + "\"></div>"
                desc = "<div>" + item.description + "</div>"
                price = "<div class=price>" + item.price + "</div>"
                if (item.stat == "SOLD") {
                    stat = "<div class=title>" + "SOLD" + "</div>"
                }
                else {
                    stat = "<div id='" + item._id + "'>"
                        + "<button type='button' "
                        + "onclick=\"sell('" + item._id + "', '" + username + "')\">BUY</button></div>";

                }
                end = "</div>"
                toInsert += start + title + image + desc + price + stat + end
            }
        });



        document.getElementById('right').innerHTML = toInsert;

    });

}

window.onload = putUserName()
document.getElementById("new_listing").onclick = newListing
document.getElementById("listings").onclick = listings
document.getElementById("purchases").onclick = purchases
document.getElementById("search_btn").onclick = search