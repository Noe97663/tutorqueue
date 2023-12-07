

function createQueue() {
  let p = fetch("/get/queue/");
  p.then((response) => {
    return response.json();
  }).then((response) => {
    console.log(response);
    let tq = document.getElementById("tutorQueue");
    for (let i = response.length - 1; i >= 0; i--) {
      // Get response data from item
      let student = response[i].student;
      let time = response[i].time;
      let date = new Date();

      date.setTime(time);
      let queueTime = date.toString().split(" ").slice(0, 5).join(" ");
      let email = response[i].studentEmail;
      let course = response[i].course;
      let description = response[i].description;
      let status = response[i].status;
      let number = i + 1;

      // create elements to display
      let entry = document.createElement("div");
      let title = document.createElement("h4");
      let courseLabel = document.createElement("h5");
      let statusLabel = document.createElement("h5");
      let descriptionLabel = document.createElement("h5");
      let nameLabel = document.createElement("h5");
      let emailLabel = document.createElement("h5");
      let helpButton = document.createElement("button");

      title.innerText = number + " (" + queueTime + ")";
      courseLabel.innerText = "Course: " + course;
      statusLabel.innerText = "Status: " + status;
      descriptionLabel.innerText = "Description: " + description;
      nameLabel.innerText = "Student Name: " + student;
      emailLabel.innerText = "Student Email: " + email;

      title.className = "queueItemTitle";
      courseLabel.className = "queueItemLabel";
      statusLabel.className = "queueItemLabel";
      descriptionLabel.className = "queueItemLabel";
      nameLabel.className = "queueItemLabel";
      emailLabel.className = "queueItemLabel";

      entry.className = "queueItem";
      entry.id = response[i].studentEmail + "div"

      
      helpButton.id = response[i].studentEmail;
      helpButton.innerText = "Help";
      helpButton.onclick = function () {
        console.log(this.id);
        handleClick(this);
      };

      entry.appendChild(title);
      entry.appendChild(courseLabel);
      entry.appendChild(statusLabel);
      entry.appendChild(descriptionLabel);
      entry.appendChild(nameLabel);
      entry.appendChild(emailLabel);
      entry.appendChild(helpButton);
      tq.appendChild(entry);
    }
  });
}

function createHelping() {
console.log("Adding to helped...");
  let p = fetch("/get/currently/helping");
  p.then((res) => {
    return res.json();
  }).then((res) => {
    for (let i = 0; i < res.length; i++) {
      let helpDiv = document.getElementById("helping");
      let curHelp = document.createElement("div");
      curHelp.innerHTML =
        res[i].student + " " + res[i].course + " " + res[i].description;
      let doneButton = document.createElement("button");
      doneButton.innerText = "Done";
      doneButton.id = res[i].studentEmail;
      doneButton.onclick = function () {
        handleDoneClick(this);
      };
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
}

function handleDoneClick(param) {
  let p = fetch("/finish/help/" + param.id);
  p.then((res) => {
    return res.text();
  }).then((resText) => {
    if (resText == "SUCCESS") {
      document.getElementById(param.id).remove();
    }
  });
}

function handleAddTutor() {}

setInterval(createQueue(), 10000);
setInterval(createHelping(), 10000);

window.onload = function () {
    checkTutorCoord();
    // get the tutorID to check if they have permission to add tutors
}

//Function is called when a TC creates a new Tutor
function addNewTutor() {
    let emailBox = document.getElementById("tutorAdd");
    let email = emailBox.value;
    let p1 = fetch("/add/tutor/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Added Tutor successfully.");
        }
        else if (text == "TUTOR_EXISTS") {
            alert("A Tutor with this email already exists.");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("No student with this email found, please make an account.")
        }
        emailBox.value = "";
    });
}

//Function is used when TC creates new TC 
function addNewCoordinator() {
    let emailBox = document.getElementById("tcAdd");
    let email = emailBox.value;
    let p1 = fetch("/add/coordinator/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Added Tutor Coordinator successfully.");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("This email does not belong to a current Tutor.");
        }
        else if (text == "EXISTS") {
            alert("A Tutor Coordinator with this email already exists.");
        }
        emailBox.value = "";
    });
}

//Function is used when TC removes a tutor
function removeTutor() {
    let emailBox = document.getElementById("tutorRemove");
    let email = emailBox.value;
    let p1 = fetch("/remove/tutor/", {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"email": email}),
    });
    p1.then((res) => {
        return res.text();
    }).then((text) => {
        if (text == "SUCCESS") {
            alert("Removed Tutor successfully.");
        }
        else if (text == "COORD") {
            alert("This email belongs to a Tutor Coordinator.");
        }
        else if (text == "FAILED_NO_STUDENT") {
            alert("This email does not belong to a current Tutor.");
        }
        emailBox.value = "";
    });
}

//Function is used when TC removes a coordinator.
function removeCoordinator() {
    let emailBox = document.getElementById("coordRemove");
    let email = emailBox.value;
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
                alert("Removed Tutor Coordinator successfully.");
            }
            else if (text == "UNAUTHORIZED") {
                alert("You are not authorized to remove this Tutor Coordinator.");
            }
            else if (text == "FAILED_NO_STUDENT") {
                alert("This email does not belong to a current Tutor Coordinator.")
            }
            emailBox.value = "";
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