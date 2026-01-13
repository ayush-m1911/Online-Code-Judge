const API_BASE = "http://127.0.0.1:8000/api";

// --------------------
// Load All Problems
// --------------------
function loadProblems() {
    fetch(`${API_BASE}/problems/`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("problem-list");
            list.innerHTML = "";

            data.forEach(problem => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <h3>${problem.title}</h3>
                    <p>${problem.description.substring(0, 80)}...</p>
                    <a href="problem.html?id=${problem.id}">Solve</a>
                    <hr>
                `;
                list.appendChild(div);
            });
        });
}
function loadProblemDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    fetch(`${API_BASE}/problems/${id}/`)
        .then(res => res.json())
        .then(problem => {
            document.getElementById("title").innerText = problem.title;
            document.getElementById("description").innerText = problem.description;

            const tcList = document.getElementById("testcases");
            tcList.innerHTML = "";

            problem.testcases.forEach(tc => {
                const li = document.createElement("li");
                li.innerHTML = `<b>Input:</b> ${tc.input_data} <br> <b>Output:</b> ${tc.expected_output}`;
                tcList.appendChild(li);
            });
        });
}
function submitCode() {
    const params = new URLSearchParams(window.location.search);
    const problemId = params.get("id");

    const code = document.getElementById("code").value;
    const language = document.getElementById("language").value;

    fetch(`${API_BASE}/submit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",  // important for Django session auth
        body: JSON.stringify({
            problem: problemId,
            code: code,
            language: language
        })
    })
    .then(res => res.json())
    .then(data => {
        const result = document.getElementById("result");

        if (data.verdict === "AC") {
            result.innerText = "✅ Accepted";
            result.style.color = "green";
        }
        else if (data.verdict === "WA") {
            result.innerText = "❌ Wrong Answer";
            result.style.color = "red";
        }
        else if (data.verdict === "TLE") {
            result.innerText = "⏳ Time Limit Exceeded";
            result.style.color = "orange";
        }
        else if (data.verdict === "CE") {
            result.innerText = "⚠️ Compilation Error";
            result.style.color = "red";
        }
        else if (data.verdict === "RE") {
            result.innerText = "⚠️ Runtime Error";
            result.style.color = "red";
        }
        else {
            result.innerText = "Error: " + JSON.stringify(data);
        }
    });
}
