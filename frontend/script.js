const API_BASE = "http://localhost:8000/api";
let editor = null;

function checkAuth() {
    const token = localStorage.getItem("access");

    if (!token) {
        window.location.href = "login.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    if (page === "index" || page === "problem" || page === "submissions") {
    checkAuth();
}
    if (page === "index") {
        loadProblems();
    }

    if (page === "problem") {
        initEditor();
        loadProblemDetail();
    }
    if (page === "submissions") {
    loadSubmissions();
}
});

function refreshToken() {

    fetch("http://localhost:8000/api/token/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refresh: localStorage.getItem("refresh")
        })
    })
    .then(res => res.json())
    .then(data => {
        localStorage.setItem("access", data.access);
        console.log("Token refreshed");
    });
}

/* =====================
   Initialize Monaco Editor
===================== */
function initEditor() {
    const editorDiv = document.getElementById("editor");
    if (!editorDiv) return;

    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor@0.44.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(editorDiv, {
            value: "// Write your code here\n",
            language: "python",
            theme: "vs-dark",
            automaticLayout: true
        });

        editor.focus();

        document.getElementById("language").addEventListener("change", (e) => {
            const map = { PY: "python", CPP: "cpp", JAVA: "java" };
            monaco.editor.setModelLanguage(editor.getModel(), map[e.target.value]);
        });
    });
}

/* =====================
   JWT LOGIN (STEP 4)
===================== */
function login(username, password) {
    refreshToken();
    fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        alert("Login Successful");
    });
}

/* =====================
   Load Problems
===================== */
function loadProblems() {

    const search = document.getElementById("search")?.value || "";
    const difficulty = document.getElementById("difficulty")?.value || "";

    let url = `${API_BASE}/problems/?`;

    if (search) {
        url += `search=${search}&`;
    }

    if (difficulty) {
        url += `difficulty=${difficulty}&`;
    }

    fetch(url)
        .then(res => res.json())
        .then(data => {

            const list = document.getElementById("problem-list");
            list.innerHTML = "";

            if (data.length === 0) {
                list.innerHTML = "<p>No problems found</p>";
                return;
            }

            data.forEach(problem => {
                const card = document.createElement("div");
                card.className = "problem-card";

                card.innerHTML = `
                    <h3>${problem.title}</h3>

                    <span class="difficulty ${problem.difficulty.toLowerCase()}">
                        ${problem.difficulty}
                    </span>

                    <p>${problem.description.substring(0, 80)}...</p>

                    <a href="problem.html?id=${problem.id}">Solve</a>
                `;

                list.appendChild(card);
            });
        });
}

/* =====================
   Load Problem Detail
===================== */
function loadProblemDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) return;

    fetch(`${API_BASE}/problems/${id}/`)
        .then(res => res.json())
        .then(problem => {

            console.log("API RESPONSE:", problem);

            document.getElementById("title").innerText = problem.title;
            document.getElementById("description").innerText = problem.description;

            document.getElementById("difficultyBadge").innerHTML = `
                <span class="difficulty ${problem.difficulty.toLowerCase()}">
                    ${problem.difficulty}
                </span>
            `;

            const tcList = document.getElementById("testcases");
            tcList.innerHTML = "";

            if (problem.test_cases && problem.test_cases.length > 0) {
                problem.test_cases.forEach(tc => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <b>Input:</b> <pre>${tc.input_data}</pre>
                        <b>Output:</b> <pre>${tc.expected_output}</pre>
                    `;
                    tcList.appendChild(li);
                });
            } else {
                tcList.innerHTML = "<li>No test cases available</li>";
            }
        });
}

/* =====================
   Submit Code (STEP 5 UPDATED)
===================== */
function submitCode() {
    const params = new URLSearchParams(window.location.search);
    const problemId = params.get("id");

    fetch(`${API_BASE}/submit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`  // ✅ JWT HEADER
        },
        body: JSON.stringify({
            problem: problemId,
            code: editor.getValue(),
            language: document.getElementById("language").value
        })
    })
    .then(res => res.json())
    .then(data => {

        const result = document.getElementById("result");

        if (data.verdict === "AC") {
            result.innerHTML = " Accepted";
            result.style.color = "green";

        } else if (data.verdict === "WA") {

            if (data.failed_input) {

                result.innerHTML = `
                     Wrong Answer <br><br>

                    <b>Input:</b>
                    <pre>${data.failed_input}</pre>

                    <b>Expected Output:</b>
                    <pre>${data.failed_expected_output}</pre>

                    <b>Your Output:</b>
                    <pre>${data.failed_user_output}</pre>
                `;

            } else {

                result.innerHTML = `
                     Wrong Answer <br>
                    Failed on hidden test case
                `;
            }

            result.style.color = "red";

        } else if (data.verdict === "TLE") {
            result.innerHTML = " Time Limit Exceeded";

        } else if (data.verdict === "CE") {
            result.innerHTML = " Compilation Error";

        } else if (data.verdict === "RE") {
            result.innerHTML = " Runtime Error";

        } else {
            result.innerText = JSON.stringify(data);
        }
    });
}



/* =====================
   CSRF helper (UNCHANGED – safe to keep)
===================== */
function getCookie(name) {
    let value = null;
    document.cookie.split(';').forEach(c => {
        c = c.trim();
        if (c.startsWith(name + '=')) {
            value = decodeURIComponent(c.substring(name.length + 1));
        }
    });
    return value;
}


function loadSubmissions() {

    const token = localStorage.getItem("access");

    console.log("TOKEN:", token);   // DEBUG

    fetch(`${API_BASE}/submissions/`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(res => {
        if (res.status === 401) {
            alert("Please login again!");
            return [];
        }
        return res.json();
    })
    .then(data => {

        console.log("DATA:", data);  // DEBUG

        const table = document.getElementById("submission-list");
        table.innerHTML = "";

        if (!data || data.length === 0) {
            table.innerHTML = "<tr><td colspan='4'>No submissions found</td></tr>";
            return;
        }

        data.forEach(sub => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${sub.problem_title}</td>
                <td style="color:${sub.verdict === 'AC' ? 'green' : 'red'}">
                    ${sub.verdict}
                </td>
                <td>${sub.language}</td>
                <td>${new Date(sub.submitted_at).toLocaleString()}</td>
            `;

            table.appendChild(row);
        });
    })
    .catch(err => {
        console.error("ERROR:", err);
    });
}

function signupUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {

        const msg = document.getElementById("msg");

        if (data.message) {
            msg.style.color = "green";
            msg.innerText = "Signup successful! Redirecting to login...";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } else {
            msg.style.color = "red";
            msg.innerText = data.error || "Signup failed";
        }
    });
}

function loginUser() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:8000/api/token/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {

        const msg = document.getElementById("msg");

        if (data.access) {
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            msg.style.color = "green";
            msg.innerText = "Login successful!";

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1000);

        } else {
            msg.style.color = "red";
            msg.innerText = "Invalid username or password";
        }
    });
}

function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "login.html";
}

