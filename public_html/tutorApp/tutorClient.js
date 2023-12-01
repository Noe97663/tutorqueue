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
    console.log("studentEmail then param");
    console.log(param);
    let p = fetch("/finish/help/" + param.id);
    p.then((res) => {
        return res.text()
    }).then((resText) => {
        if (resText == "SUCCESS") {
            document.getElementById(param.id).remove()
        }
    })
}


setInterval(createQueue(), 10000);
setInterval(createHelping(), 10000);