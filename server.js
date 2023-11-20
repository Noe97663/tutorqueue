const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public_html"));
app.use(express.urlencoded());


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
    tutorID: Number
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
function authenticate(res, res, next) {
    let c = req.cookies;
    console.log(c);
    if (c.login != undefined) {
        if (sessions[c.login.username] != undefined &&
            sessions[c.login.username].id == c.login.sessionID) {
            
            console.log(c);
            next();
        } else {
            console.log("failed auth because user is invalid");
            res.redirect("/login/login.html");
        }
    } else {
        console.log("failed auth because cookue is wack man");
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

app.use("/tutor/", authenticate);
setInterval(removeSessions, 2000);

/**Login as a Tutor or Student. If a tutor, send to tutor home page. If Student, send to student home. */
app.post("/login/", (req, res) => {
    let type = req.body.type;
    let username = req.body.username;
    let password = req.body.password;
    // Login as student, going to help page
    console.log("User:" + username + " Pass:" + password);
    if (type == "studentType"){
        let findStudent = Student.find({name: username, password: password}).exec();
        findStudent.then((results) =>{
            if (results.length == 0){
                res.status(500).send("Login Failed: incorrect username and/or password");
            }
            else{
                /** */
                let sid = addSession(username);  
                res.cookie("login", 
                {username: username, sessionID: sid}, 
                {maxAge: 600000 * 2 });
                res.end("/studentApp/requestHelp.html");
            }
        });
    }   
    // Login as tutor, going to tutor page
    else if (type == "tutorType"){
        let findTutor = Tutor.find({name: username, password: password}).exec();
        findTutor.then((results) =>{
            if (results.length == 0){
                res.status(500).send("Login Failed: incorrect username and/or password");
            }
            else{
                let sid = addSession(username);  
                res.cookie("login", 
                {username: username, sessionID: sid}, 
                {maxAge: 600000 * 2 });
                res.redirect("tutorApp/tutorHome.html");
            }
        });
    }   
    else{
        res.status(404).send("Invalid login");
    }
});


/** Returns the current total queue in FIFO time order */
app.get("/get/queue/", (req, res) => {

});

/** Adds a new queue item to the queue and DB */
app.post("/add/queueitem/", (req, res) =>{

});

/** Removes given queue item from queue and DB */
app.get("/remove/queueitem/:item", (req, res) =>{

});

/** Returns JSON array of all student items, which TC can use to choose tutors */
app.get("/get/students/", (req, res) =>{

});

/** Returns JSON array of all tutor items */
app.get("/get/tutors/", (req, res) =>{

});
/** Adds a new Student account to the system */
app.post("/add/student/", (req, res) =>{
    let name = req.body.name;
    let email = req.body.email;
    let pass = req.body.password;

    let newStudent = new Student({
        name: name,
        email: email,
        password: pass,
        tutorID: -1
      });
    return newStudent.save().then((result) => {
        res.end("Successfully added user.")
      }).catch((err) => {
        console.log(err)
      });
});
/** Allows TC to assign a student as a tutor */
app.post("/add/tutor/", (req, res) =>{

})

app.listen(port, () => {
    console.log(`server running on http://${ip}:${port}`);
});