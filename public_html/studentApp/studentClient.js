function createQueue() {
    if (window.location.pathname == "/studentApp/studentHome.html") {
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
}

setInterval(createQueue(), 10000);

/** When pages loads the following checks are made:
 * Check if the user is a tutor to give extra navigation.
 * Also check if user has submitted a help request
 */
window.onload = () => {
    checkForTutor();
    checkFormSubmission();
    helpForm = document.getElementById("askForHelpForm");
    if (helpForm != null) {
        helpForm.addEventListener("submit", addQueueItem);
    }
}

/**
 * Function which adds a help request submitted by a student to the Queue.
 * Student is redirected to snake.html to play snake game.
 * @param {*} e is the submit event which occurred upon submitting the form.
 */
function addQueueItem(e) {
    e.preventDefault();
    let course = document.getElementById("course").value;
    let desc = document.getElementById("description").value;

    let promise = fetch("/student/add/queue", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({
            course: course,
            description: desc
        })
    });
    promise.then((response) => {
        window.location.href = "./studentOptions.html"
    }).catch((err) => {console.log(err);});
}

/**
 * Check if the student has already submitted a help request. If
 * so, redirect to the snake game.
 */
function checkFormSubmission() {
    if (window.location.pathname == "/studentApp/requestHelp.html") {
        let promise = fetch("/student/check/queue");
        promise.then((response) => {
            return response.text();
        }).then((result) => {
            if (result == "in queue") {
                window.location.href = "./studentOptions.html"
            }
        }).catch((err) => {console.log(err);});
    }
}

/**
 * This function checks if the user is a tutor. If so, an 
 * extra navigation feature will appear on the page.
 */
function checkForTutor() {
    let checkIsTutor = fetch("/get/istutor/");
    checkIsTutor.then((result) =>{
        return result.text();
    }).then((text) =>{
        if (text == "true") {
            let navBar = document.getElementById("navigationBar");
            let tutorLink = document.createElement("a");
            tutorLink.href = "../tutorApp/tutorhome.html";
            tutorLink.className="navLink";
            tutorLink.id="tutorLink";
            tutorLink.innerHTML = "Tutor Center";
            navBar.appendChild(tutorLink);
            
            let checkTC = fetch("/get/iscoord/");
            checkTC.then((response) => {
                return response.text();
            }).then((result) => {
                if (result == "true") {
                    let addTutorLink = document.createElement("a");
                    addTutorLink.href = "../tutorApp/addTutors.html";
                    addTutorLink.className="navLink";
                    addTutorLink.id="tutorLink";
                    addTutorLink.innerHTML = "Add New Tutors";
                    navBar.appendChild(addTutorLink);
                }
            }).catch((err) => console.log(err));
        }
    }).catch((error) =>console.log(error));
}

/**
 * This function executes when a student removes themself from the queue
 */
function selfRemoval() {
    let p = fetch("/get/email");
    p.then((response) => {
        return response.text();
    }).then((email) => {
        let p1 = fetch("/remove/queueitem/" + email);
        p1.then((response) => {
            window.location.href = "./requestHelp.html";
        }).catch((err) => {console.log(err);});
    }).catch((err) => {console.log(err);});
}

function changeGame(){
    var select = document.getElementById("gamesSelect");
    var embedding = document.getElementById("gameEmbedding");
    let link = select.value;
    console.log("changing embedded game link to " + link);
    embedding.src = link;

}