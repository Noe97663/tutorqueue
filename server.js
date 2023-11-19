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
    password: String,
    isTutor: Boolean
});

const TutorSchema = new Schema({
    name: String,
    password: String,
    tutorCoordinationRank: Number,
    studentsHelped: Number
});

const AdminSchema = new Schema({
    name: String,
    password: String
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
var AdminItem = mongoose.model("Admin", AdminSchema);

const cookieParser = require("cookie-parser");
const { Console } = require("console");
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
        let last = sessions[username[i]].time;
        if (last + 20000000 < now) {
            delete sessions[username[i]];
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

    if (type == "studentType"){
        let findStudent = Student.find({username: username, password: password}).exec();
        findStudent.then((results) =>{
            if (results.length == 0){
                res.status(500).send("Login Failed: incorrect username and/or password");
            }
            else{
                let sid = addSession(username);  
                res.cookie("login", 
                {username: username, sessionID: sid}, 
                {maxAge: 600000 * 2 });
                res.redirect("studentApp/requestHelp.html");
            }
        });
        
    }   
    else if (type == "tutorType"){
        let findTutor = Tutor.find({username: username, password: password}).exec();
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
    else if (type == "adminType"){
        let findAdmin = Admin.find({username: username, password: password}).exec();
        findAdmin.then((results) =>{
            if (results.length == 0){
                res.status(500).send("Login Failed: incorrect username and/or password");
            }
            else{
                let sid = addSession(username);  
                res.cookie("login", 
                {username: username, sessionID: sid}, 
                {maxAge: 600000 * 2 });
                res.redirect("adminApp/adminHome.html");
            }
        });
        
    }
    else{
        res.status(500).send("Invalid login");
    }
    //res.end(JSON.stringify(req.body));
    // search database for username password combo put promise in p
    
    /*
    let p = 0

    p.then((results) => {
        if (results.lenght == 0) {
            res.end("could not find account");
        } else {
            console.log("Accound found: creating cookie");
            let sid = addSession(user.usernname);
            res.cookie(
                "login",
                {username: user.username, sessionID: sid},
                {maxAge: 600000 * 3600}
            );
            res.end("SUCCESS");
        }
    });
    */
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

/** Returns JSON array of all student items */
app.get("/get/students/", (req, res) =>{

});

/** Returns JSON array of all tutor items */
app.get("/get/tutors/", (req, res) =>{

});

app.listen(port, () => {
    console.log(`server running on http://${ip}:${port}`);
});