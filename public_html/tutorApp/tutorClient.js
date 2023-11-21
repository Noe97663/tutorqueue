function createQueue() {
    let p = fetch("/get/queue/");
    p.then((response) => {
        return response.json()
    }).then((response) =>{
        let tq = document.getElementById("tutorQueue");
        for (let i = 0; i < response.length; i++) {
            let entry = document.createElement("div");
            entry.innerHTML = response[i].student + " " + response[i].course;
            let helpButton = document.createElement("button");
            helpButton.onclick = "helpStudent()";
            helpButton.innerText = "Help";
            entry.appendChild(helpButton);
            tq.appendChild(entry);
        }
    });
}


setInterval(createQueue(), 10000);