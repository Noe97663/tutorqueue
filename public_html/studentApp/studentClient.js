/**
Authors: Joseph Cortez
         Kyle Walker
         Noel Poothokaran
         Skyler DeVaughn
Course: Csc 337 Webdev Benjamin Dicken Fall 2023
Purpose: Client code for student page operations. Including the following:
        Populates the live queue with queueitems from Database and
        sets their style to fit. 
        Allows users to
*/

/**
 * Gets the current state of the queue from the server and DB, and populates the DOM elements live.
 * Adds styling and updates the values in chronological ordwer to show the queue in its live state
 * for students and tutors to see.
 */
function createQueue() {
  if (window.location.pathname == "/studentApp/studentHome.html") {
    let p = fetch("/get/queue/studenthome");
    p.then((response) => {
      return response.json();
    }).then((response) => {
      console.log(response);
      let tq = document.getElementById("queueViewArea");
      for (let i = response.length - 1; i >= 0; i--) {
        // Get response data from item
        let student = response[i].student;
        let time = response[i].time;
        let date = new Date();

        // Get values from the db entries
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

        // Set contents of each DOM element
        title.innerText = number + " (" + queueTime + ")";
        courseLabel.innerText = "Course: " + course;
        statusLabel.innerText = "Status: " + status;
        descriptionLabel.innerText = "Description: " + description;
        nameLabel.innerText = "Student Name: " + student;
        emailLabel.innerText = "Student Email: " + email;

        // Set Class to apply CSS style automatically
        title.className = "queueItemTitle";
        courseLabel.className = "queueItemLabel";
        statusLabel.className = "queueItemLabel";
        descriptionLabel.className = "queueItemLabel";
        nameLabel.className = "queueItemLabel";
        emailLabel.className = "queueItemLabel";
        entry.className = "queueItem";
        // Append all created elements to the parent div, and then the queue div
        entry.appendChild(title);
        entry.appendChild(courseLabel);
        entry.appendChild(statusLabel);
        entry.appendChild(descriptionLabel);
        entry.appendChild(nameLabel);
        entry.appendChild(emailLabel);
        tq.appendChild(entry);
      }
    });
  }
}

/** CreateQueue is updated live on an interval */
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
};

/**
 * Function which adds a help request submitted by a student to the Queue.
 * Student is redirected to the studentOptions page to see the changes applied
 * @param {*} e is the submit event which occurred upon submitting the form.
 */
function addQueueItem(e) {
  e.preventDefault();
  let course = document.getElementById("course").value;
  let desc = document.getElementById("description").value;

  let promise = fetch("/student/add/queue", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      course: course,
      description: desc,
    }),
  });
  promise
    .then((response) => {
      window.location.href = "./studentOptions.html";
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * Check if the student has already submitted a help request. If
 * so, redirect to the waiting page
 */
function checkFormSubmission() {
  if (window.location.pathname == "/studentApp/requestHelp.html") {
    let promise = fetch("/student/check/queue");
    promise
      .then((response) => {
        return response.text();
      })
      .then((result) => {
        if (result == "in queue") {
          window.location.href = "./studentOptions.html";
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

/**
 * This function checks if the user is a tutor. If so, an
 * extra navigation feature will appear on the page to the Tutor Home page.
 */
function checkForTutor() {
  let checkIsTutor = fetch("/get/istutor/");
  checkIsTutor
    .then((result) => {
      return result.text();
    })
    .then((text) => {
      if (text == "true") {
        let navBar = document.getElementById("navigationBar");
        let tutorLink = document.createElement("a");
        tutorLink.href = "../tutorApp/tutorhome.html";
        tutorLink.className = "navLink";
        tutorLink.id = "tutorLink";
        tutorLink.innerHTML = "Tutor Center";
        navBar.appendChild(tutorLink);

        let checkTC = fetch("/get/iscoord/");
        checkTC
          .then((response) => {
            return response.text();
          })
          .then((result) => {
            if (result == "true") {
              let addTutorLink = document.createElement("a");
              addTutorLink.href = "../tutorApp/addTutors.html";
              addTutorLink.className = "navLink";
              addTutorLink.id = "tutorLink";
              addTutorLink.innerHTML = "Add New Tutors";
              navBar.appendChild(addTutorLink);
            }
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((error) => console.log(error));
}

/**
 * This function executes when a student removes themself from the queue, requesting the server to remove their
 * corresponding queue item from the queue.
 */
function selfRemoval() {
  let p = fetch("/get/email");
  p.then((response) => {
    return response.text();
  })
    .then((email) => {
      let p1 = fetch("/remove/queueitem/" + email);
      p1.then((response) => {
        window.location.href = "./requestHelp.html";
      }).catch((err) => {
        console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });
}

/**
 * Allows user to change the embedded game on the page using the select combobox. Switches active embedded link
 */
function changeGame() {
  var select = document.getElementById("gamesSelect");
  var embedding = document.getElementById("gameEmbedding");
  let link = select.value;
  console.log("changing embedded game link to " + link);
  embedding.src = link;
}
