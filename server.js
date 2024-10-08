/**
Authors: Joseph Cortez
         Kyle Walker
         Noel Poothokaran
         Skyler DeVaughn
Course: Csc 337 Webdev Benjamin Dicken Fall 2023
Purpose: The main server for the TutorQueue site, which handles client requests and interacts with DBMS.
        Uses Node, Express, and Mongoose. The project is divided into different folders which require authentication
        using cookies from the user session, meaning pages are only accessible to users in sessions approved to 
        access them.
*/

// Node modules
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server address and port
let ip = "137.184.41.80";
let port = "80";

// Mongoose
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/TutorQueue");
mongoose.connection.on("error", () => {
  console.log("ERROR CONNECTING TO MONGODB");
});

// Student schema
let Schema = mongoose.Schema;
const StudentSchema = new Schema({
  name: String,
  email: String,
  password: String,
  salt: String,
  tutorID: Number,
});

// Tutor Schema
const TutorSchema = new Schema({
  tutorID: Number,
  tutorCoordinationRank: Number,
  studentsHelped: Number,
  helpInfo: { course: String, hours: Number },
});

// Queue items 
const QueueItemSchema = new Schema({
  time: Number,
  student: String,
  studentEmail: String,
  tutor: String,
  course: String,
  description: String,
  status: String,
});

var Student = mongoose.model("Student", StudentSchema);
var Tutor = mongoose.model("Tutor", TutorSchema);
var QueueItem = mongoose.model("QueueItem", QueueItemSchema);

const cookieParser = require("cookie-parser");
app.use(cookieParser());
let sessions = {};

/**
 * Authenticates to check if a user is signed in before allowing access to special
 * folders. If a user is not logged in, they cannot enter private pages
 * @param {*} req Request
 * @param {*} res Result
 * @param {*} next Next Request
 */
function authenticate(req, res, next) {
  let c = req.cookies;
  if (c.login != undefined) {
    if (
      sessions[c.login.username] != undefined &&
      sessions[c.login.username].id == c.login.sessionID
    ) {
      next();
    } else {
      console.log("failed auth because user is invalid");
      res.redirect("/login/login.html");
    }
  } else {
    console.log("failed auth because cookie is wack man");
    res.redirect("/login/login.html");
  }
}

/**
 * @param username name of the user who you are making the session for
 * adds a session
 */
function addSession(username) {
  let sid = Math.floor(Math.random() * 100000000000);
  let now = Date.now();
  sessions[username] = { id: sid, time: now };
  return sid;
}
/**
 * remove sessions that have expired
 */
function removeSessions() {
  let now = Date.now;
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    if (last + 20000000 < now) {
      delete sessions[usernames[i]];
    }
  }
}

// These app folders require authentication to logged in users only
app.use("/tutorApp/", authenticate);
app.use("/studentApp/", authenticate);
// Public html folder
app.use(express.static("public_html"));
// Set interval for authenitcation
setInterval(removeSessions, 2000);

/**
 * creates an admin for testing
 */
app.get("/create/admin", (req, res) => {
  let adminTutor = Tutor({
    tutorID: 0,
    tutorCoordinationRank: 0,
    studentsHelped: 0,
    helpInfo: {},
  });
  adminTutor
    .save()
    .then((result) => {
      //res.send("created Tutor Admin");
    })
    .catch((error) => {
      //res.send("something went wrong creating Tutor Admin.");
    });
  let pword = encryptPassword("a");
  let adminStudent = new Student({
    name: "Admin",
    email: "admin@arizona.edu",
    password: pword.password,
    salt: pword.salt,
    tutorID: 0,
  });
  adminStudent
    .save()
    .then((result) => {
      res.end("successfully added Student Admin.");
    })
    .catch((error) => {
      res.end("admin already created.");
    });
});

const crypto = require("crypto");

/**
 * @param {*} password is the password given by user to login.
 * @param {*} encryptedPass is the encrypted password stored in db.
 * @param {*} salt is the salt used with the encryption.
 * @returns true if the password matches. Fale otherwise.
 */
function checkPassword(password, encryptedPass, salt) {
  const hash = crypto.createHmac("sha256", salt);
  hash.update(password);
  let encrypted = hash.digest("hex");
  return encryptedPass === encrypted;
}

/**Login as a Tutor or Student. If a tutor, send to tutor home page. If Student, send to student home. */
app.post("/login/", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  // Login as student, going to help page

  let findStudent = Student.find({ name: username }).exec();
  findStudent.then((results) => {
    if (results.length == 0) {
      res.status(500).send("Login Failed: incorrect username and/or password");
    } else {
      let passMatch = checkPassword(
        password,
        results[0].password,
        results[0].salt
      );
      if (!passMatch) {
        res
          .status(500)
          .send("Login Failed: incorrect username and/or password");
      } else {
        let sid = addSession(username);
        let email = results[0].email;
        let isTutor = results[0].tutorID > -1;
        let tid = results[0].tutorID;
        let checkTC = Tutor.find({
          tutorID: tid,
          tutorCoordinationRank: { $gt: -1 },
        });
        checkTC
          .then((results) => {
            let isTC = results.length > 0;
            res.cookie(
              "login",
              {
                username: username,
                sessionID: sid,
                email: email,
                isTutor: isTutor,
                tid: tid,
                isTC: isTC,
              },
              { maxAge: 600000 * 2 }
            );
            if (isTutor) {
              res.end("/tutorApp/tutorHome.html");
            } else {
              res.end("/studentApp/requestHelp.html");
            }
          })
          .catch((err) => console.log(err));
      }
    }
  });
});

/** Returns the current total queue in FIFO time order */
app.get("/get/queue/studenthome", (req, res) => {
  let findQueueEntires = QueueItem.find({ status: "open" }).exec();
  findQueueEntires
    .then((results) => {
      res.end(JSON.stringify(results));
    })
    .catch((error) => {
      res.end("something went wrong getting the queue.");
    });
});

/** Returns the current total queue in FIFO time order */
app.get("/get/queue/tutorhome", (req, res) => {
    let username = req.cookies.login.username;
    let findQueueEntires = QueueItem.find({ status: "open",  student: {$ne: username}}).exec();
    findQueueEntires
      .then((results) => {
        res.end(JSON.stringify(results));
      })
      .catch((error) => {
        res.end("something went wrong getting the queue.");
      });
  });

app.get("/get/email/", (req, res) => {
  res.end(String(req.cookies.login.email));
});

// removes a student from the tutor queue by adding the tutors
// email to the tutor field and changing the status to "In Progress"
app.get("/remove/queue/:email/:tEmail", (req, res) => {
    let tutorEmail = req.params.tEmail;
    const addTutor = {
        $set: {
            time: Date.now(),
            tutor: tutorEmail,
            status:"In Progress"
        }
    }
    let p = QueueItem.updateOne({studentEmail: req.params.email, tutor: "none"},  addTutor, {upsert: true}).exec();
    p.then((response) => {
        res.end("SUCCESS");
    }).catch((err) => {
        console.log(err);
        res.end("FAILED");
    });
});

/** Adds a new queue item to the queue and DB */
app.post("/add/queueitem/", (req, res) => {});

/** Removes given queue item from queue and DB */
app.get("/remove/queueitem/:studentEmail", (req, res) => {
  let email = req.params.studentEmail;
  const removeStudent = { $set: { status: "removed" } };
  let p = QueueItem.updateOne(
    { studentEmail: email, status: "open" },
    removeStudent
  );
  p.then((response) => {
    res.end("removed");
  }).catch((err) => {
    console.log(err);
  });
});

/** Returns JSON array of all student items, which TC can use to choose tutors */
app.get("/get/students/", (req, res) => {});

/** Returns JSON array of all tutor items */
app.get("/get/tutors/", (req, res) => {});

/**
 * @param {*} password is a string of password entered by user.
 * @returns object containing the encrypted password and random salt.
 */
function encryptPassword(password) {
  var generatedSalt = crypto.randomBytes(16);
  const salt = generatedSalt.toString("hex");
  const hash = crypto.createHmac("sha256", salt);
  hash.update(password);
  var encryptedPass = hash.digest("hex");
  return { password: encryptedPass, salt: salt };
}

/** Adds a new Student account to the system */
app.post("/add/student/", (req, res) => {
    let name = req.body.name;
    Student.find({name: name}).then((users) => {
        if (users.length != 0) {
            res.status(500).send("Username already taken: Please Try again");
        } else {
            let email = req.body.email;
            Student.find({email: email}).then((users1) => {
                if (users1.length != 0) {
                    res.status(700).send("Email already taken: Please Try again");
                }
                else {
                    let encryptionData = encryptPassword(req.body.password);
                    console.log("adding student user")
                    let newStudent = new Student({
                        name: name,
                        email: email,
                        password: encryptionData.password,
                        salt: encryptionData.salt,
                        tutorID: -1
                      });
                    return newStudent.save().then((result) => {
                        res.end("Successfully added user.")
                      }).catch((err) => {
                        console.log(err)
                        res.end("Failed to add used");
                      });
                }
            });
        }
    }).catch((err) => {console.log(err)});
});

/** Allows TC to assign a student as a tutor */
app.post("/add/tutor/", (req, res) =>{
    console.log("adding tutor");
    console.log(req.body);
    let studentFind = Student.find({email: req.body.email}).exec();
    studentFind.then((result) => {
        if (result.length == 0) {
            res.end("FAILED_NO_STUDENT");
        }
        else if (result[0].tutorID != -1) {
            res.end("TUTOR_EXISTS");
        }
        else {
            let id = Math.floor(Math.random() * 10000000);
            result[0].updateOne({tutorID: id}).exec();
            let newTutor = new Tutor({
                tutorID: id,
                tutorCoordinationRank: -1,
                studentsHelped: 0,
                helpInfo: {},
            });
            newTutor.save();
            res.end("SUCCESS");
        }
    })
});

//Allows TC to add a new TC to the database.
app.post("/add/coordinator/", (req, res) => {
    let studentFind = Student.find({email: req.body.email}).exec();
    studentFind.then((result) => {
        if (result.length == 0) {
            res.end("FAILED_NO_STUDENT");
        }
        else {
            let id = result[0].tutorID;
            let tutorFind = Tutor.find({tutorID: id}).exec();
            tutorFind.then((results) => {
                if (results.length == 0) {
                    res.end("FAILED_NO_STUDENT");
                } else if (results[0].tutorCoordinationRank != -1) {
                    res.end("EXISTS");
                }
                else {
                    let rank = Tutor.countDocuments({tutorCoordinationRank: {$gt: -1}}).exec();
                    rank.then((num) => {
                        results[0].updateOne({tutorCoordinationRank: num}).exec();
                        res.end("SUCCESS");
                    });
                }
            });
        }
    });
});

//Allow a TC to remove another tutor
app.post("/remove/tutor/", (req, res) => {
    let studentFind = Student.find({email: req.body.email}).exec();
    studentFind.then((student) => {
        if (student.length == 0) {res.end("FAILED_NO_STUDENT");}
        else {
            let id = student[0].tutorID;
            let del = Tutor.find({tutorID: id}).exec();
            del.then((tutor) => {
                if (tutor.length == 0) {
                    res.end("FAILED_NO_STUDENT");
                } else if (tutor[0].tutorCoordinationRank != -1) {
                    res.end("COORD")
                } else {
                    student[0].updateOne({tutorID: -1}).exec();
                    tutor[0].deleteOne({}).exec();
                    res.end("SUCCESS");
                }
            });
        }
    });
});

//Allow a TC to remove another TC
app.post("/remove/coordinator/", (req, res) => {
    let rank = Number(req.body.rank);
    let studentFind = Student.find({email: req.body.email}).exec();
    studentFind.then((student) => {
        if (student.length == 0) {res.end("FAILED_NO_STUDENT");}
        else {
            let tutorFind = Tutor.find({tutorID: student[0].tutorID}).exec();
            tutorFind.then((tutor) => {
                if (tutor.length == 0 || tutor[0].tutorCoordinationRank < 0) {
                    res.end("FAILED_NO_STUDENT");
                } else if (tutor[0].tutorCoordinationRank <= rank) {
                    res.end("UNAUTHORIZED");
                } else {
                    tutor[0].updateOne({tutorCoordinationRank: -1}).exec();
                    res.end("SUCCESS");
                }
            });
        }
    });
});

// Resets cookies
app.get("/remove/cookie/", (req, res) => {
  res.cookies = null;
});

//Adds a student to the queue.
app.post("/student/add/queue", (req, res) => {
  let newHelpRequest = new QueueItem({
    time: Date.now(),
    student: req.cookies.login.username,
    studentEmail: req.cookies.login.email,
    tutor: "none",
    course: req.body.course,
    description: req.body.description,
    status: "open",
  });
  return newHelpRequest
    .save()
    .then((result) => {
      res.send("added to queue");
    })
    .catch((error) => {
      console.log(error);
    });
});

//Checks if a student is already in the queue so student does not submit
//another request
app.get("/student/check/queue", (req, res) => {
  let alreadtInQueue = QueueItem.find({
    student: req.cookies.login.username,
    status: "open",
  }).exec();
  alreadtInQueue
    .then((result) => {
      if (result.length != 0) {
        res.end("in queue");
      } else {
        res.end("not in queue");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

// this changed the ticket status in the db to "done"
app.get("/finish/help/:studentEmail", (req, res) => {
    let p = QueueItem.findOne({studentEmail: req.params.studentEmail, status:"In Progress"}).exec();
    p.then((res) => {
        console.log(res.time);
        return [res.time, res.course];
    }).then((info) => {
        let newTime = Date.now() - info[0];
        console.log(newTime);
        const finishSession = {
            $set: {
                status: "done",
                time: newTime,
            }
        }
        let p1 = QueueItem.updateOne({studentEmail: req.params.studentEmail, status:"In Progress"}, finishSession).exec();
        p1.then((res) => {
            console.log("removed");
        });
        let p2 = Tutor.findOne({tutorID: req.cookies.login.tid}).exec();
        p2.then((res) => {
            console.log(res.helpInfo);
            return res.helpInfo;
        }).then((helpInfo) => {
            if (helpInfo[info[1]] == undefined) {
                helpInfo[info[0]] = newTime
            }
            else {
                helpInfo[info[0]] += newTime;
            }
            console.log(helpInfo);
            let p3 = Tutor.updateOne({tutorID: req.cookies.login.tid}, {$set:{helpInfo: helpInfo}});
            p3.then((res) => {
                console.log("added helptime");
            })
        })
    })
    p.catch((err) => {
        console.log(err);
    })
    
})

// gets the QueueItems that a tutor is currently helping
app.get("/get/currently/helping", (req, res) => {
  let helping = QueueItem.find({
    tutor: req.cookies.login.email,
    status: "In Progress",
  }).exec();
  helping
    .then((response) => {
      res.end(JSON.stringify(response));
    })
    .catch((err) => {
      console.log(err);
      console.log("ERROR");
    });
});

// returns a logged in users "isTutor" attribute
app.get("/get/istutor/", (req, res) => {
  let isTutor = req.cookies.login.isTutor;
  res.end(String(isTutor));
});

// returns a logged in users "isTC" attribute
app.get("/get/iscoord/", (req, res) => {
  let isTutorCoord = req.cookies.login.isTC;
  res.end(String(isTutorCoord));
});

// returns a logged in users "tid" attribute
app.get("/get/tutorID/", (req, res) => {
  let tid = req.cookies.login.tid;
  res.end(String(tid));
});

/**Returns the rank of the current logged in tutor */
app.get("/get/rank", (req, res) => {
  let find = Tutor.find({ tutorID: req.cookies.login.tid });
  find.then((result) => {
    res.end(String(result[0].tutorCoordinationRank));
  });
});

app.listen(port, () => {
  console.log(`server running on http://${ip}:${port}`);
});
