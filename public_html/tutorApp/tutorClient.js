/**
Authors: Joseph Cortez
         Kyle Walker
         Noel Poothokaran
         Skyler DeVaughn
Course: Csc 337 Webdev Benjamin Dicken Fall 2023
Purpose: Client functionality for tutor pages. Has similar live queue view as the student Queue home page, but this one
        includes extra buttons for helping students in queue as a tutor, and Done buttons in helped students page to confirm
        when sessions are completed.
*/

/**
 * Updates live Queue view by making server request to DB of all students in queue, and updates the DOM by creating and appending
 * new elements to display the queue as a row of items.
 */
function createQueue() {
  // Request to server for all queueitems in current queue
  let p = fetch("/get/queue/tutorhome");
  p.then((response) => {
    return response.json();
  }).then((response) => {
    console.log(response);
    let tq = document.getElementById("queueViewArea");
    for (let i = 0; i < response.length; i++) {
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

      // Set text of the fields to display
      title.innerText = number + " (" + queueTime + ")";
      courseLabel.innerText = "Course: " + course;
      statusLabel.innerText = "Status: " + status;
      descriptionLabel.innerText = "Description: " + description;
      nameLabel.innerText = "Student Name: " + student;
      emailLabel.innerText = "Student Email: " + email;
      // Set class to automatically apply CSS styling
      title.className = "queueItemTitle";
      courseLabel.className = "queueItemLabel";
      statusLabel.className = "queueItemLabel";
      descriptionLabel.className = "queueItemLabel";
      nameLabel.className = "queueItemLabel";
      emailLabel.className = "queueItemLabel";
      entry.className = "queueItem";
      // Store IDS for button function identification
      entry.id = response[i].studentEmail + "div";
      helpButton.id = response[i].studentEmail;
      helpButton.innerText = "Help";
      // Button function for Hel
      helpButton.onclick = function () {
        console.log(this.id);
        handleClick(this);
      };
      // Append new elements to Div
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

/**
 * Creates the view for the current student helping session, with a button that allows tutor to confirm when help is done.
 * Requests the student that the tutor is currently helping, and appends a new DOM element displaying the session info and
 * allowing tutor to end when finished.
 */
function createHelping() {
  console.log("Adding to helped...");
  // request currently helping student
  let p = fetch("/get/currently/helping");
  p.then((res) => {
    return res.json();
  }).then((res) => {
    if (res.length != 0) {
        var helpDiv = document.getElementById("helpViewArea");
        let helpHeader = document.createElement("p");
        helpHeader.innerHTML = "Currently Helping";
        helpDiv.appendChild(helpHeader);
    }
    for (let i = 0; i < res.length; i++) {
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

/**
 * Handles "help" button presses within queue itssems, so that each help button will correspond to its
 * correct queueitem and update the tutors helping session automatically.
 * @param {*} param the reference to the button which was clicked, which stores info to identify caller
 */
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
  location.reload();
}

/**
 * Button handler for the Done buttons of tutor session, which marks completion of a tutoring session
 * and removes it from the queue and helping view.
 * @param {*} param Reference to the caller button, which stores corresponding ID to student session
 */
function handleDoneClick(param) {
  console.log(param.id);
  let p = fetch("/finish/help/" + param.id);
  p.then((res) => {
    return res.text();
  }).then((resText) => {
    if (resText == "SUCCESS") {
      console.log(param.id);
      document.getElementById(param.id).remove();
    }
  });
  location.reload();
}

function handleAddTutor() {}

// Update queue live on interval, and helping view
setInterval(createQueue(), 10000);
setInterval(createHelping(), 10000);

//Check if the tutor has a coordinator rank, because coordinators will have access to the add new tutors page
window.onload = function () {
  checkTutorCoord();
  // get the tutorID to check if they have permission to add tutors
};

/**
 * Adds a new Tutor when the input box includes a student valid email. Makes a request to server to set a student as a tutor.
 * Shows alerts for invalid or nonexistent users
 */
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

/**
 * Adds a new Tutor Coordinator when the input box includes a tutor valid email. Makes a request to server to set a tutor as a coordinator.
 * Shows alerts for invalid or nonexistent users. Only tutors can be set as coordinators, which gives them permission to add other tutors and
 * coordinators
 */
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

/**
 * Allows Coordinator to remove a tutor of lower rank by email included in the input field. Gives alerts for invalid emails.
 * Only Coordinators can do this to tutors with TC ranks lower than them
 */
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

/**
 * Allows Coordinator to remove a coordinator with lower rank by email included in the input field. Gives alerts for invalid emails.
 * Only coordinators can do this to coordinators with a rank lower than them
 */
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

/** Checks if a tutor is a coordinator to grant special permissions. If so, the AddTutor navigation link will appear
 * in navbar to open access to the coordinator page
*/
function checkTutorCoord() {
  let isTutorCoord = fetch("/get/iscoord");
  isTutorCoord
    .then((response) => {
      return response.text();
    })
    .then((result) => {
      if (result == "true") {
        let navBar = document.getElementById("navigationBar");
        let addTutorLink = document.createElement("a");
        addTutorLink.href = "./addTutors.html";
        addTutorLink.className = "navLink";
        addTutorLink.id = "tutorLink";
        addTutorLink.innerHTML = "Add New Tutors";
        navBar.appendChild(addTutorLink);
      }
    });
}
