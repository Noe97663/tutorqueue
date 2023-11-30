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
            helpButton.onclick = () => {
                let b = fetch("/get/email/");
                b.then((response) => {
                    return response.text();
                }).then((response) =>{
                    let c = fetch("/remove/queue/" + this.id + "/" + response);
                    c.then((response) => {
                        document.getElementById(this.id + "div").remove();
                    }).catch((err) => {
                        console.log(err);
                    })
                })
            };
            helpButton.innerText = "Help";
            entry.appendChild(helpButton);
            tq.appendChild(entry);
        }
    });
}


setInterval(createQueue(), 10000);