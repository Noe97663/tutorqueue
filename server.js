const express = require("express");
const app = express();
app.use(express.json());
app.use(express.static("public_html"));
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

app.use("/tutorApp/", authenticate);
app.use("/studentApp/", authenticate);
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
        res.send("created Tutor Admin");
    }).catch((error) => {
        res.send("something went wrong creating Tutor Admin.");
    });
    let adminStudent = new Student({
        name: "Admin",
        email: "admin@admin.com",
        password: "a",
        salt: "what",
        tutorID: 0,
    });
    adminStudent.save().then((result) => {
        res.end("successfully added Student Admin.");
    }).catch((error) => {
        res.end("admin already created.");
    });
})

/**Login as a Tutor or Student. If a tutor, send to tutor home page. If Student, send to student home. */
app.post("/login/", (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    // Login as student, going to help page
    
    let findStudent = Student.find({name: username, password: password}).exec();
    findStudent.then((results) =>{
        if (results.length == 0){
            res.status(500).send("Login Failed: incorrect username and/or password");
        }
        else{
            console.log(results[0].email);
            let sid = addSession(username); 
            let email = results[0].email;
            console.log("User: " + username + " Pass:" + password + " TID: " + results[0].tutorID);
            let isTutor = Number(results[0].tutorID) > -1;
            res.cookie("login", 
            {username: username, sessionID: sid,
             email: email, isTutor: isTutor}, 
            {maxAge: 600000 * 2 });
            res.end("/studentApp/requestHelp.html");
        }
    });
});


/** Returns the current total queue in FIFO time order */
app.get("/get/queue/", (req, res) => {
    let findQueueEntires = QueueItem.find({status: "open"});
    findQueueEntires.then((results) => {
        res.end(JSON.stringify(results));
    }).catch((error) => {
        res.end("something went wrong getting the queue.")
    })
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
    console.log("adding student user")
    let newStudent = new Student({
        name: name,
        email: email,
        password: pass,
        tutorID: "-1"
      });
    return newStudent.save().then((result) => {
        res.end("Successfully added user.")
      }).catch((err) => {
        console.log(err)
      });
});
/** Allows TC to assign a student as a tutor */
app.post("/add/tutor/", (req, res) =>{

});

app.get("/remove/cookie/", (req, res) => {
    res.cookies = null;
});

app.post("/student/add/queue", (req, res) => {
    console.log(req.cookies.login.username);
    let alreadtInQueue = QueueItem.find({studentEmail: req.cookies.login.email, status: "open"}).exec();
    alreadtInQueue.then((result) => {
        console.log(result);
        if (result.length != 0) {
            res.end("you are already in the queue...")
        } else {
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
                res.redirect("/studentApp/studentHome.html");
                //res.end("successfully added help request.");
            }).catch((error) => {
                console.log(error);
            })
        }
    });
    
});

app.get("/get/istutor/", (req,res) =>{
    let isTutor = req.cookies.login.isTutor;
    res.end(String(isTutor));
})

app.listen(port, () => {
    console.log(`server running on http://${ip}:${port}`);
});