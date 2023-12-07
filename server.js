const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


let ip = "127.0.0.1";
let port = "80";

const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/TutorQueue");
mongoose.connection.on("error", () => {
    console.log("ERROR CONNECTING TO MONGODB");
});

let Schema = mongoose.Schema;
const StudentSchema = new Schema({
    name: String,
    email: String,
    password: String,
    salt: String,
    tutorID: Number,
});

const TutorSchema = new Schema({
    tutorID: Number,
    tutorCoordinationRank: Number,
    studentsHelped: Number,
    helpInfo: {course: String, hours: Number}
});

const QueueItemSchema = new Schema({
    time: Number,
    student: String,
    studentEmail: String,
    tutor: String,
    course: String,
    description: String,
    status: String
});

var Student = mongoose.model("Student", StudentSchema);
var Tutor = mongoose.model("Tutor", TutorSchema);
var QueueItem = mongoose.model("QueueItem", QueueItemSchema);

const cookieParser = require("cookie-parser");
app.use(cookieParser());
let sessions = {};

// TODO: Check if user is student or tutor to determine which pages are visible
function authenticate(req, res, next) {
    let c = req.cookies;
    if (c.login != undefined) {
        if (sessions[c.login.username] != undefined &&
            sessions[c.login.username].id == c.login.sessionID) {

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
    let now = Date.now()
    sessions[username] = {id: sid, time: now};
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

app.use("/tutorApp/", authenticate);
app.use("/studentApp/", authenticate);

app.use(express.static("public_html"));
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
    adminTutor.save().then((result) => {
        //res.send("created Tutor Admin");
    }).catch((error) => {
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
    adminStudent.save().then((result) => {
        res.end("successfully added Student Admin.");
    }).catch((error) => {
        res.end("admin already created.");
    });
})

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
    
    let findStudent = Student.find({name: username}).exec();
    findStudent.then((results) =>{
        if (results.length == 0){
            res.status(500).send("Login Failed: incorrect username and/or password");
        }
        else{
            let passMatch = checkPassword(password, results[0].password, results[0].salt);
            if (!passMatch) {
                res.status(500).send("Login Failed: incorrect username and/or password");
            } else {
                let sid = addSession(username); 
                let email = results[0].email;
                let isTutor = Number(results[0].tutorID) > -1;
                let tid = Number(results[0].tutorID);
                res.cookie("login", 
                    {username: username, sessionID: sid,
                    email: email, isTutor: isTutor, tid: tid}, 
                    {maxAge: 600000 * 2});
                if (isTutor) {
                    res.end("/tutorApp/tutorHome.html")
                } else {
                    res.end("/studentApp/requestHelp.html");
                }
            }
        }
    });
});

/** Returns the current total queue in FIFO time order */
app.get("/get/queue/", (req, res) => {
    let findQueueEntires = QueueItem.find({status: "open"}).exec();
    findQueueEntires.then((results) => {
        res.end(JSON.stringify(results));
    }).catch((error) => {
        res.end("something went wrong getting the queue.")
    })
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
app.post("/add/queueitem/", (req, res) =>{

});

/** Removes given queue item from queue and DB */
app.get("/remove/queueitem/:studentEmail", (req, res) => {
    let email = req.params.studentEmail;
    const removeStudent = {$set: {status: "removed"}};
    let p = QueueItem.updateOne({studentEmail: email, status: "open"}, removeStudent);
    p.then((response) => {
        res.end("removed");
    }).catch((err) => {console.log(err);});
});

/** Returns JSON array of all student items, which TC can use to choose tutors */
app.get("/get/students/", (req, res) =>{

});

/** Returns JSON array of all tutor items */
app.get("/get/tutors/", (req, res) =>{

});

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
    return {password: encryptedPass, salt: salt};
}

/** Adds a new Student account to the system */
app.post("/add/student/", (req, res) => {
    let name = req.body.name;
    Student.find({name: name}).then((users) => {
        if (users.length != 0) {
            res.status(500).send("Username already taken: Please Try again");
        } else {
            let email = req.body.email;
            let encryptionData = encryptPassword(req.body.password);
            console.log("adding student user")
            let newStudent = new Student({
                name: name,
                email: email,
                password: encryptionData.password,
                salt: encryptionData.salt,
                tutorID: "-1"
              });
            return newStudent.save().then((result) => {
                res.end("Successfully added user.")
              }).catch((err) => {
                console.log(err)
                res.end("Failed to add used");
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
        else if (result.length > 1) {
            res.end("FAILED_TOO_MANY");
        }
        else {
            let numTutors = Tutor.countDocuments({}).exec();
            numTutors.then((num) => {
                result[0].updateOne({tutorID: num}).exec();
                let newTutor = new Tutor({
                    tutorID: num,
                    tutorCoordinationRank: 0,
                    studentsHelped: 0,
                    helpInfo: {},
                });
                newTutor.save();
            });
            res.end("SUCCESS");
        }
    })
});

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
    return newHelpRequest.save().then((result) => {
        res.send("added to queue");
    }).catch((error) => {
        console.log(error);
    }); 
});

//Checks if a student is already in the queue so student does not submit
//another request
app.get("/student/check/queue", (req, res) => {
    let alreadtInQueue = QueueItem.find({student: req.cookies.login.username, status: "open"}).exec();
    alreadtInQueue.then((result) => {
        if (result.length != 0) {
            res.end("in queue");
        } else  {
            res.end("not in queue");
        }
    }).catch((err) => {console.log(err);});
});

// this changed the ticket status in the db to "done" 
app.get("/finish/help/:studentEmail", (req, res) => {
    const finishSession = {
        $set: {
            status:"done"
        }
    }
    let p = QueueItem.updateOne({studentEmail: req.params.studentEmail, status:"In Progress"},  finishSession).exec();
    p.then((res) => {
        console.log("successfully ended tutor session");
    })
    p.catch((err) => {
        console.log(err);
    })
})

// gets the QueueItems that a tutor is currently helping
app.get("/get/currently/helping", (req, res) => {
    let helping = QueueItem.find({tutor: req.cookies.login.email, status:"In Progress"}).exec();
    helping.then((response) => {
        res.end(JSON.stringify(response));
    }).catch((err) => {
        console.log(err);
        console.log("ERROR");
    });
});

// returns a logged in users "isTutor" attribute
app.get("/get/istutor/", (req,res) => {
    let isTutor = req.cookies.login.isTutor;
    res.end(String(isTutor));
})

// returns a logged in users "tid" attribute
app.get("/get/tutorID/", (req, res) => {
    let tid = req.cookies.login.tid;
    res.end(String(tid));
})

app.listen(port, () => {
    console.log(`server running on http://${ip}:${port}`);
});