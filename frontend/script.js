const API_BASE = "http://localhost:8000/api";
let editor = null;

document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;

    if (page === "index") {
        loadProblems();
    }

    if (page === "problem") {
        initEditor();
        loadProblemDetail();
    }
});

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
   Load Problems
===================== */
function loadProblems() {
    fetch(`${API_BASE}/problems/`)
        .then(res => res.json())
        .then(data => {
            const list = document.getElementById("problem-list");
            list.innerHTML = "";

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
   Submit Code
===================== */
function submitCode() {
    const params = new URLSearchParams(window.location.search);
    const problemId = params.get("id");

    fetch(`${API_BASE}/submit/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken")
        },
        credentials: "include",
        body: JSON.stringify({
            problem: problemId,
            code: editor.getValue(),
            language: document.getElementById("language").value
        })
    })
    .then(res => res.json())
    .then(data => {
        const result = document.getElementById("result");
        result.innerText = data.verdict;
    });
}

/* =====================
   CSRF helper
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
