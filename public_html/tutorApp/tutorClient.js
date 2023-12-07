function createQueue() {
    let p = fetch("/get/queue/");
    p.then((response) => {
        return response.json();
    }).then((response) =>{
        let tq = document.getElementById("tutorQueue");
        for (let i = 0; i < response.length; i++) {
            let entry = document.createElement("div");
            entry.id = response[i].studentEmail + "div"
            entry.innerHTML = response[i].student + " " + response[i].course;
            let helpButton = document.createElement("button");
            helpButton.id = response[i].studentEmail;
            helpButton.innerText = "Help";
            helpButton.onclick = function() {
                console.log(this.id);
                handleClick(this);
            };
            entry.appendChild(helpButton);
            tq.appendChild(entry);
        }
    });
}

function createHelping() {
    let p = fetch("/get/currently/helping");
    p.then((res) => {
        return res.json();
    }).then((res) => {
        for (let i = 0; i < res.length; i++) {
            let helpDiv = document.getElementById("helping");
            let curHelp = document.createElement("div");
            curHelp.innerHTML = res[i].student + " " + res[i].course + " " + res[i].description;
            let doneButton = document.createElement("button");
            doneButton.innerText = "Done";
            doneButton.id = res[i].studentEmail;
            doneButton.onclick = function() {
                handleDoneClick(this);
            } 
            curHelp.appendChild(doneButton);
            helpDiv.append(curHelp);
        }
    });
}

function handleClick(param) {
    console.log("CLICKED");
    let b = fetch("/get/email/");
    b.then((response) => {
        return response.text();
    }).then((response) => {
        let path = "/remove/queue/" + param.id + "/" + response;
        let c = fetch(path);
        c.then((response) => {
            let toRemoveDiv = document.getElementById(param.id + "div");
            let helpInfo = toRemoveDiv.innerText;
            toRemoveDiv.remove();
            console.log("helpInfo");
            console.log(helpInfo);
        }).catch((err) => {
            console.log(err);
        });
    });
};

function handleDoneClick(param) {
    let p = fetch("/finish/help/" + param.id);
    p.then((res) => {
        return res.text()
    }).then((resText) => {
        if (resText == "SUCCESS") {
            document.getElementById(param.id).remove()
        }
    })
}

function handleAddTutor() {
    
}

setInterval(createQueue(), 10000);
setInterval(createHelping(), 10000);

window.onload = function () {
    checkTutorCoord();
    // get the tutorID to check if they have permission to add tutors
}

//Function is called when a TC creates a new Tutor
function addNewTutor() {
    console.log("clicked!");
    let email = document.getElementById("tutorAdd").value;
    let p1 = fetch("/add/tutor/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Added tutor, happy tooting.");
        }
        else if (text == "FAILED_TOO_MANY") {
            alert("Multiple students with the same email, contact your IT staff ASAP. This is never supposed to happen bruh.");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("No student with that email found, please make an account.")
        }
    });
}

//Function is used when TC creates new TC 
function addNewCoordinator() {
    let email = document.getElementById("tcAdd").value;
    let p1 = fetch("/add/coordinator/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Added coordinator, happy tooting.");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("The given email does not belong to a current tutor");
        }
        else if (text == "FAILED_TOO_MANY") {
            alert("Multiple students with the same email, contact your IT staff ASAP. This is never supposed to happen bruh.");
        }
    });
}

//Function is used when TC removes a tutor
function removeTutor() {
    let email = document.getElementById("tutorRemove").value;
    let p1 = fetch("/remove/tutor/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Removed tutor");
        }
        else if (text == "NOT_A_TUTOR") {
            alert("The given email does not belong to a current tutor or belongs to a Tutor Coordinator");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("No tutor with that email found.");
        }
    });
}

//Function is used when TC removes a coordinator.
function removeCoordinator() {
    let email = document.getElementById("coordRemove").value;
    let p = fetch("/get/rank/");
    p.then((response) => {
        return response.text();
    }).then((rank) => {
        let p1 = fetch("/remove/coordinator/", {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"email": email, "rank": rank}),
        });
        p1.then((res) => {
            return res.text();
        }).then((text) => {
            if (text == "SUCCESS") {
                alert("Removed Tutor Coordinator");
            }
            else if (text == "UNAUTHORIZED") {
                alert("You are not authorized to remove this Tutor Coordinator");
            }
            else if (text == "FAILED_NO_STUDENT") {
                alert("No Tutor Coordinator with that email found.")
            }
        }); 
    });
}

    function checkTutorCoord() {
        let isTutorCoord = fetch("/get/iscoord");
        isTutorCoord.then((response) => {
            return response.text();
        }).then((result) => {
            if (result == "true") {
                let navBar = document.getElementById("navigationBar");
                let addTutorLink = document.createElement("a");
                addTutorLink.href = "./addTutors.html";
                addTutorLink.className="navLink";
                addTutorLink.id="tutorLink";
                addTutorLink.innerHTML = "Add New Tutors";
                navBar.appendChild(addTutorLink);
            }
        });
    }