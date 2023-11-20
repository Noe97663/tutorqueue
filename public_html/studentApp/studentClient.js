function createQueue() {
    console.log("creating queue for student...");
    let p = fetch("/get/queue/");
    p.then((response) => {
        return response.json()
    }).then((response) =>{
        console.log(response);
        let tq = document.getElementById("queueViewArea");
        for (let i = 0; i < response.length; i++) {
            let entry = document.createElement("div");
            entry.innerHTML = response[i].student + " " + response[i].course;
            tq.appendChild(entry);
        }
    });
}

setInterval(createQueue(), 10000);


window.onload = () =>{
    let checkIsTutor = fetch("/get/istutor/");
    checkIsTutor.then((result) =>{
        return result.text();
    }).then((text) =>{
        console.log(text);
        if (text == "true"){
            let navBar = document.getElementById("navigationBar");
            let tutorLink = document.createElement("a");
            tutorLink.href = "../tutorApp/tutorhome.html";
            tutorLink.className="navLink";
            tutorLink.id="tutorLink";
            tutorLink.innerHTML = "Tutor Center";
            navBar.appendChild(tutorLink);
        }
    })
    checkIsTutor.catch((error) =>{
        console.log(error);
    })
}