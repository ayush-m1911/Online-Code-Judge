/* =========================================================
   CodeJudge – script.js
   ========================================================= */

const API_BASE = "http://localhost:8000/api";
let editor = null;
let consoleOpen = true;
let problemTestCases = [];   // store loaded test cases

/* =========================================================
   PAGE INIT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  if (page === "index" || page === "problem" || page === "submissions") {
    checkAuth();
  }

  if (page === "index") loadProblems();
  if (page === "problem") { initEditor(); loadProblemDetail(); initResizableDivider(); }
  if (page === "submissions") loadSubmissions();
});

/* =========================================================
   AUTH
   ========================================================= */
function checkAuth() {
  if (!localStorage.getItem("access")) {
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  showToast("Logged out", "info");
  setTimeout(() => { window.location.href = "login.html"; }, 700);
}

function refreshToken() {
  return fetch(`${API_BASE}/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: localStorage.getItem("refresh") })
  }).then(r => r.json()).then(d => { if (d.access) localStorage.setItem("access", d.access); });
}

/* =========================================================
   TOAST
   ========================================================= */
function showToast(msg, type = "info") {
  const icons = { success: "✓", error: "✕", info: "⬡" };
  const c = document.getElementById("toast-container");
  if (!c) return;
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || "•"}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => {
    t.style.cssText += "opacity:0;transform:translateY(10px);transition:all 0.3s ease";
    setTimeout(() => t.remove(), 320);
  }, 2800);
}

/* =========================================================
   MONACO EDITOR
   ========================================================= */
const defaultCode = {
  PY: `# Write your solution here\n\ndef solve():\n    pass\n\nsolve()\n`,
  CPP: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    \n    // Write your solution here\n    \n    return 0;\n}\n`,
  JAVA: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Write your solution here\n    }\n}\n`
};

const langToFilename = { PY: "solution.py", CPP: "solution.cpp", JAVA: "Solution.java" };
const langToMonaco = { PY: "python", CPP: "cpp", JAVA: "java" };

function initEditor() {
  const editorDiv = document.getElementById("editor");
  if (!editorDiv) return;

  require.config({ paths: { vs: "https://unpkg.com/monaco-editor@0.44.0/min/vs" } });

  require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(editorDiv, {
      value: defaultCode["PY"],
      language: "python",
      theme: "vs-dark",
      automaticLayout: true,
      fontSize: 14,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
      fontLigatures: true,
      minimap: { enabled: false },
      lineNumbers: "on",
      renderLineHighlight: "line",
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      cursorBlinking: "smooth",
      cursorSmoothCaretAnimation: "on",
      smoothScrolling: true,
      tabSize: 4,
      wordWrap: "off"
    });

    editor.focus();

    const langSel = document.getElementById("language");
    if (langSel) {
      langSel.addEventListener("change", (e) => {
        const lang = e.target.value;
        monaco.editor.setModelLanguage(editor.getModel(), langToMonaco[lang]);
        editor.setValue(defaultCode[lang] || "");
        const fn = document.getElementById("editor-filename");
        if (fn) fn.textContent = langToFilename[lang] || "solution";
      });
    }
  });
}

function resetEditor() {
  if (!editor) return;
  const lang = document.getElementById("language")?.value || "PY";
  editor.setValue(defaultCode[lang] || "");
  showToast("Editor reset", "info");
}

function copyCode() {
  if (!editor) return;
  navigator.clipboard.writeText(editor.getValue())
    .then(() => showToast("Code copied!", "success"))
    .catch(() => showToast("Copy failed", "error"));
}

/* =========================================================
   RESIZABLE DIVIDER
   ========================================================= */
function initResizableDivider() {
  const divider = document.getElementById("ws-divider");
  const left = document.getElementById("ws-left");
  const workspace = document.getElementById("workspace");
  if (!divider || !left || !workspace) return;

  let dragging = false;

  divider.addEventListener("mousedown", (e) => {
    dragging = true;
    divider.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const rect = workspace.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    const clamped = Math.min(Math.max(pct, 25), 70);
    left.style.width = `${clamped}%`;
  });

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    divider.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    // trigger Monaco relayout
    if (editor) editor.layout();
  });
}

/* =========================================================
   LEFT PANEL TABS
   ========================================================= */
function switchTab(btn, panelId) {
  document.querySelectorAll(".ws-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".ws-tab-body").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}

/* =========================================================
   CONSOLE
   ========================================================= */
function toggleConsole() {
  consoleOpen = !consoleOpen;
  const wrap = document.getElementById("console-wrap");
  const chevron = document.getElementById("console-chevron");
  if (wrap) wrap.classList.toggle("collapsed", !consoleOpen);
  if (chevron) chevron.style.transform = consoleOpen ? "rotate(0deg)" : "rotate(-90deg)";
  setTimeout(() => { if (editor) editor.layout(); }, 300);
}

function switchConsoleTab(btn, panelId) {
  document.querySelectorAll(".console-tab").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".cout-panel").forEach(p => p.classList.remove("active"));
  btn.classList.add("active");
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add("active");
}

function setConsoleStatus(status) {
  const dot = document.getElementById("console-dot");
  const label = document.getElementById("console-label");
  if (!dot || !label) return;
  dot.className = "console-status-dot";
  const map = {
    running: ["", "Running…"],
    success: ["green", "Accepted"],
    error: ["red", "Error"],
    warn: ["yellow", "TLE / Warning"],
    idle: ["", "Idle"]
  };
  const [cls, text] = map[status] || ["", status];
  if (cls) dot.classList.add(cls);
  label.textContent = text;
}

function openConsole() {
  if (!consoleOpen) toggleConsole();
}

/* =========================================================
   TEST CASES  (left panel)
   ========================================================= */
function renderTestCases(testCases) {
  const list = document.getElementById("tc-list");
  if (!list) return;

  if (!testCases || testCases.length === 0) {
    list.innerHTML = `<p style="color:#475569; font-size:0.84rem;">No test cases available.</p>`;
    return;
  }

  list.innerHTML = testCases.map((tc, i) => `
    <div class="tc-card" id="tc-card-${i}">
      <div class="tc-card-header">
        <span class="tc-card-label">Case ${i + 1}</span>
        <button class="tc-run-single" onclick="runSingleTestCase(${i})">
          <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M4 3l9 5-9 5V3z" fill="currentColor"/></svg>
          Run
        </button>
      </div>
      <div class="io-block" style="margin-bottom:8px;">
        <div class="io-block-label">Input</div>
        <pre>${escapeHtml(tc.input_data)}</pre>
      </div>
      <div class="io-block output-block">
        <div class="io-block-label">Expected Output</div>
        <pre>${escapeHtml(tc.expected_output)}</pre>
      </div>
      <div class="tc-result-row" id="tc-result-${i}" style="display:none;"></div>
    </div>
  `).join('');
}

function runSingleTestCase(idx) {
  const tc = problemTestCases[idx];
  if (!tc || !editor) return;

  const params = new URLSearchParams(window.location.search);
  const problemId = params.get("id");

  setConsoleStatus("running");
  openConsole();

  fetch(`${API_BASE}/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access")}` },
    body: JSON.stringify({
      problem: problemId,
      code: editor.getValue(),
      language: document.getElementById("language").value,
      custom_input: tc.input_data
    })
  })
    .then(r => r.json())
    .then(data => {
      const out = (data.output || "").trim();
      const exp = (tc.expected_output || "").trim();
      const pass = out === exp;

      // Update card result
      const resEl = document.getElementById(`tc-result-${idx}`);
      if (resEl) {
        resEl.style.display = "flex";
        resEl.className = `tc-result-row ${pass ? "pass" : "fail"}`;
        resEl.innerHTML = pass
          ? `✓ Passed`
          : `✕ Wrong Answer — got: <code style="margin-left:6px;">${escapeHtml(out.substring(0, 60))}</code>`;
      }

      // Show in console
      setConsoleStatus(pass ? "success" : "error");
      updateOutputConsole(data.output, data.stderr);
      updateTCResultsConsole([{ input: tc.input_data, expected: tc.expected_output, got: data.output, pass }]);
      switchConsoleTab(document.querySelector(".console-tab"), "cout-output");
    })
    .catch(() => {
      setConsoleStatus("error");
      document.getElementById("output-content").textContent = "Run endpoint not available. Use Submit to test your solution.";
      openConsole();
    });
}

function addCustomTestCase() {
  const form = document.getElementById("tc-custom-form");
  if (form) { form.style.display = "block"; form.scrollIntoView({ behavior: "smooth", block: "center" }); }
}

function closeCustomForm() {
  const form = document.getElementById("tc-custom-form");
  if (form) form.style.display = "none";
}

function runWithCustom() {
  const input = document.getElementById("tc-custom-input")?.value || "";
  const params = new URLSearchParams(window.location.search);
  const problemId = params.get("id");
  if (!editor) return;

  setConsoleStatus("running");
  openConsole();

  fetch(`${API_BASE}/run/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access")}` },
    body: JSON.stringify({
      problem: problemId,
      code: editor.getValue(),
      language: document.getElementById("language").value,
      custom_input: input
    })
  })
    .then(r => r.json())
    .then(data => {
      setConsoleStatus(data.output !== undefined ? "success" : "error");
      updateOutputConsole(data.output, data.stderr);
      switchConsoleTab(document.getElementById("ctab-output") || document.querySelector(".console-tab"), "cout-output");
    })
    .catch(() => {
      setConsoleStatus("idle");
      document.getElementById("output-content").textContent = "Run endpoint not available.";
    });
}

/* =========================================================
   LOAD PROBLEM DETAIL
   ========================================================= */
function loadProblemDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  fetch(`${API_BASE}/problems/${id}/`)
    .then(r => r.json())
    .then(problem => {
      // Navbar
      const ht = document.getElementById("header-title");
      if (ht) ht.textContent = problem.title;
      document.title = `CodeJudge – ${problem.title}`;

      const hd = document.getElementById("header-difficulty");
      if (hd) hd.innerHTML = `<span class="difficulty ${(problem.difficulty || '').toLowerCase()}">${problem.difficulty || ''}</span>`;

      // Description tab
      const titleEl = document.getElementById("title");
      if (titleEl) titleEl.textContent = problem.title;
      const badge = document.getElementById("difficultyBadge");
      if (badge) badge.innerHTML = `<span class="difficulty ${(problem.difficulty || '').toLowerCase()}">${problem.difficulty || ''}</span>`;
      const desc = document.getElementById("description");
      if (desc) desc.textContent = problem.description;
      const constraintsDiv = document.getElementById("descr-constraints");

      if (constraintsDiv) {
        if (problem.constraints && problem.constraints.trim() !== "") {
          constraintsDiv.innerHTML = `
      <div class="constraint-box">
        ${escapeHtml(problem.constraints)}
      </div>
    `;
        } else {
          constraintsDiv.innerHTML = `
      <p style="color:#475569; font-size:0.84rem;">
        No constraints provided.
      </p>
    `;
        }
      }
      // Examples section in description tab
      const exDiv = document.getElementById("descr-examples");
      if (exDiv) {
        if (problem.test_cases && problem.test_cases.length > 0) {
          exDiv.innerHTML = problem.test_cases.slice(0, 2).map((tc, i) => `
            <div style="margin-bottom:16px;">
              <div style="font-size:0.73rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px;">Example ${i + 1}</div>
              <div class="io-block">
                <div class="io-block-label">Input</div>
                <pre>${escapeHtml(tc.input_data)}</pre>
              </div>
              <div class="io-block output-block">
                <div class="io-block-label">Output</div>
                <pre>${escapeHtml(tc.expected_output)}</pre>
              </div>
            </div>`).join('');
        } else {
          exDiv.innerHTML = `<p style="color:#475569; font-size:0.84rem;">No examples available.</p>`;
        }
      }

      // Test Cases tab
      problemTestCases = problem.test_cases || [];
      renderTestCases(problemTestCases);
    })
    .catch(err => {
      console.error("loadProblemDetail:", err);
      showToast("Failed to load problem", "error");
    });
}

/* =========================================================
   RUN CODE (all test cases)
   ========================================================= */
function runCode() {
  if (!editor) {
    showToast("Editor not ready", "error");
    return;
  }

  const btn = document.getElementById("run-btn");
  btnLoading(btn, true, "Running…");

  setConsoleStatus("running");
  openConsole();

  const params = new URLSearchParams(window.location.search);
  const problemId = params.get("id");

  // 🔥 Use first sample test case OR empty input
  let inputData = "";
  if (problemTestCases.length > 0) {
    inputData = problemTestCases[0].input_data;
  }

  fetch(`${API_BASE}/run/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access")}`
    },
    body: JSON.stringify({
      problem: problemId,
      code: editor.getValue(),
      language: document.getElementById("language").value,
      custom_input: inputData   // 🔥 KEY CHANGE
    })
  })
    .then(res => res.json())
    .then(data => {
      btnLoading(btn, false);

      // ✅ Only show output (NO validation)
      updateOutputConsole(data.output, data.stderr);
      document.getElementById("tc-results-content").innerHTML = `
      <p style="color:#64748b; padding:12px;">
        ⚡ Run mode: Showing output only (no validation)
      </p>
    `;

      // 🔥 Smart status handling
      if (data.stderr) {
        setConsoleStatus("error");
        switchConsoleTab(document.querySelectorAll(".console-tab")[1], "cout-errors");
      } else {
        setConsoleStatus("success");
        switchConsoleTab(document.querySelectorAll(".console-tab")[0], "cout-output");
      }
    })
    .catch(() => {
      btnLoading(btn, false);
      setConsoleStatus("error");

      document.getElementById("output-content").textContent =
        "Run failed. Check backend.";

      showToast("Run failed", "error");
    });
}

/* =========================================================
   SUBMIT CODE
   ========================================================= */
function submitCode() {
  if (!editor) { showToast("Editor not ready", "error"); return; }
  const btn = document.getElementById("submit-btn");
  btnLoading(btn, true, "Submitting…");
  setConsoleStatus("running");
  openConsole();

  const params = new URLSearchParams(window.location.search);
  const problemId = params.get("id");

  fetch(`${API_BASE}/submit/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("access")}` },
    body: JSON.stringify({
      problem: problemId,
      code: editor.getValue(),
      language: document.getElementById("language").value
    })
  })
    .then(r => r.json())
    .then(data => {
      btnLoading(btn, false);
      renderVerdict(data);
    })
    .catch(err => {
      btnLoading(btn, false);
      setConsoleStatus("error");
      document.getElementById("output-content").textContent = `Network error: ${err.message}`;
      showToast("Submission failed", "error");
    });
}

function renderVerdict(data) {
  const verdictMap = {
    AC: { label: "Accepted", cls: "ac", st: "success", toast: "success" },
    WA: { label: "Wrong Answer", cls: "wa", st: "error", toast: "error" },
    TLE: { label: "Time Limit Exceeded", cls: "tle", st: "warn", toast: "error" },
    CE: { label: "Compilation Error", cls: "ce", st: "error", toast: "error" },
    RE: { label: "Runtime Error", cls: "re", st: "error", toast: "error" }
  };

  const v = verdictMap[data.verdict] || { label: data.verdict || "Unknown", cls: "wa", st: "error", toast: "error" };
  setConsoleStatus(v.st);
  showToast(v.label, v.toast);

  // Switch to Output tab and show verdict
  const outTab = document.querySelector(".console-tab");
  switchConsoleTab(outTab, "cout-output");

  let html = `<div class="verdict-wrap">
    <span class="result-verdict ${v.cls}">${verdictIcons(data.verdict)} ${v.label}</span>`;

  if (data.verdict === "WA") {
    if (data.failed_input) {
      html += `
        <div style="margin-top:14px;">
          <div class="io-block" style="margin-bottom:8px; background:#161b22;">
            <div class="io-block-label">Input</div>
            <pre>${escapeHtml(data.failed_input)}</pre>
          </div>
          <div class="io-block output-block" style="margin-bottom:8px; background:#161b22;">
            <div class="io-block-label">Expected Output</div>
            <pre>${escapeHtml(data.failed_expected_output || '')}</pre>
          </div>
          <div class="io-block" style="border-left-color:#ef4444; background:#161b22;">
            <div class="io-block-label" style="color:#ef4444;">Your Output</div>
            <pre>${escapeHtml(data.failed_user_output || '')}</pre>
          </div>
        </div>`;
    } else {
      html += `<p class="verdict-sub-info">Failed on a hidden test case.</p>`;
    }
  } else if (data.verdict === "CE" && data.error) {
    html += `<div class="io-block" style="margin-top:12px; border-left-color:#ef4444; background:#161b22;">
      <pre style="color:#fca5a5;">${escapeHtml(data.error)}</pre>
    </div>`;
    // Also populate errors tab
    document.getElementById("errors-content").textContent = data.error;
  }

  html += `</div>`;
  document.getElementById("output-content").innerHTML = html;
}

function verdictIcons(v) {
  return { AC: "✓", WA: "✕", TLE: "⟳", CE: "⚙", RE: "⚠" }[v] || "•";
}

/* =========================================================
   HELPERS – output console
   ========================================================= */
function updateOutputConsole(stdout, stderr) {
  const out = document.getElementById("output-content");
  const errs = document.getElementById("errors-content");
  if (out) out.textContent = stdout || "(no output)";
  if (errs) errs.textContent = stderr || "No errors.";
}

function updateTCResultsConsole(results) {
  const el = document.getElementById("tc-results-content");
  if (!el) return;
  const pass = results.filter(r => r.pass).length;
  const total = results.length;

  const badge = document.getElementById("tc-badge");
  if (badge) {
    badge.style.display = "inline-flex";
    badge.textContent = `${pass}/${total}`;
    badge.className = `tc-result-badge ${pass === total ? "all-pass" : ""}`;
  }

  el.innerHTML = results.map((r, i) => `
    <div class="tc-console-item">
      <div class="tc-console-icon ${r.pass ? "pass" : "fail"}">${r.pass ? "✓" : "✕"}</div>
      <div class="tc-console-body">
        <div class="tc-console-title">Case ${i + 1} — ${r.pass ? "Passed" : "Wrong Answer"}</div>
        ${!r.pass ? `
          <div class="tc-console-detail">Expected: ${escapeHtml((r.expected || '').substring(0, 80))}</div>
          <div class="tc-console-detail">Got:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${escapeHtml((r.got || '').substring(0, 80))}</div>
        ` : ""}
      </div>
    </div>`).join('');
}

function btnLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) {
    btn.disabled = true;
    btn._orig = btn.innerHTML;
    btn.innerHTML = `<span style="display:inline-block;animation:spin 0.7s linear infinite;font-size:0.85rem;">◌</span> ${text || ""}`;
  } else {
    btn.disabled = false;
    if (btn._orig) btn.innerHTML = btn._orig;
  }
}

/* =========================================================
   LOAD PROBLEMS (index.html)
   ========================================================= */
function loadProblems() {
  const search = document.getElementById("search")?.value.trim() || "";
  const difficulty = document.getElementById("difficulty")?.value || "";
  const topic = document.getElementById("topic")?.value || "";

  let url = `${API_BASE}/problems/?`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  if (difficulty) url += `difficulty=${encodeURIComponent(difficulty)}&`;
  if (topic) url += `topic=${encodeURIComponent(topic)}&`;

  const list = document.getElementById("problem-list");
  if (list) list.innerHTML = `<div class="spinner"></div>`;

  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (!list) return;
      list.innerHTML = "";

      if (!data || data.length === 0) {
        list.innerHTML = `
          <div class="empty-state fade-in">
            <h3>No problems found</h3>
            <p>Try a different search or filter.</p>
          </div>`;
        return;
      }

      const wrap = document.createElement("div");
      wrap.className = "problems-table-wrap fade-in";
      wrap.innerHTML = `
        <table class="problems-table">
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Difficulty</th><th>Tags</th><th></th>
            </tr>
          </thead>
          <tbody id="problems-tbody"></tbody>
        </table>`;
      list.appendChild(wrap);

      const tbody = document.getElementById("problems-tbody");
      data.forEach((problem, idx) => {
        const tr = document.createElement("tr");
        tr.className = "slide-up";
        tr.style.animationDelay = `${idx * 0.04}s`;

        const tags = problem.tags || problem.topic || "";
        const tagHtml = tags
          ? `<span style="background:rgba(99,102,241,0.12);color:#a5b4fc;padding:2px 10px;border-radius:99px;font-size:0.72rem;">${tags}</span>`
          : `<span style="color:#475569;font-size:0.8rem;">—</span>`;

        tr.innerHTML = `
          <td class="problem-number">${problem.id}</td>
          <td><a href="problem.html?id=${problem.id}" class="problem-title-link">${escapeHtml(problem.title)}</a></td>
          <td><span class="difficulty ${(problem.difficulty || '').toLowerCase()}">${problem.difficulty || '—'}</span></td>
          <td>${tagHtml}</td>
          <td><a href="problem.html?id=${problem.id}" class="solve-btn">Solve →</a></td>`;

        tr.addEventListener("click", e => {
          if (!e.target.closest("a")) window.location.href = `problem.html?id=${problem.id}`;
        });
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("loadProblems:", err);
      if (list) list.innerHTML = `<div class="empty-state"><p style="color:#ef4444;">Failed to load. Is the server running?</p></div>`;
    });
}

/* =========================================================
   LOAD SUBMISSIONS
   ========================================================= */
function loadSubmissions() {
  fetch(`${API_BASE}/submissions/`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("access")}` }
  })
    .then(r => { if (r.status === 401) { window.location.href = "login.html"; return []; } return r.json(); })
    .then(data => {
      const tbody = document.getElementById("submission-list");
      if (!tbody) return;
      tbody.innerHTML = "";

      if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4">
        <div class="empty-state">
          <h3>No submissions yet</h3>
          <p>Solve a problem and submit your first solution!</p>
          <a href="index.html" style="display:inline-flex;margin-top:14px;padding:10px 22px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;font-weight:600;text-decoration:none;">Browse Problems</a>
        </div>
      </td></tr>`;
        return;
      }

      const ll = { PY: "Python", CPP: "C++", JAVA: "Java" };
      const vl = { AC: "Accepted", WA: "Wrong Answer", TLE: "TLE", CE: "Compile Error", RE: "Runtime Error" };

      data.forEach((sub, i) => {
        const tr = document.createElement("tr");
        tr.className = "fade-in";
        tr.style.animationDelay = `${i * 0.05}s`;
        tr.innerHTML = `
        <td>${escapeHtml(sub.problem_title || `Problem #${sub.problem}`)}</td>
        <td><span class="verdict-badge ${sub.verdict}">${verdictIcons(sub.verdict)} ${vl[sub.verdict] || sub.verdict}</span></td>
        <td><span class="lang-badge">${ll[sub.language] || sub.language}</span></td>
        <td class="time-text">${new Date(sub.submitted_at).toLocaleString()}</td>`;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error("loadSubmissions:", err);
      const tbody = document.getElementById("submission-list");
      if (tbody) tbody.innerHTML = `<tr><td colspan="4" style="color:#ef4444;text-align:center;padding:20px;">Failed to load</td></tr>`;
    });
}

/* =========================================================
   AUTH FORMS
   ========================================================= */
function loginUser() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value;
  const btn = document.getElementById("login-btn");
  const msg = document.getElementById("msg");

  if (!username || !password) { setMsg(msg, "Please fill in all fields.", "error"); return; }
  btnLoading(btn, true, "Signing in…");

  fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(r => r.json())
    .then(data => {
      btnLoading(btn, false);
      if (data.access) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        setMsg(msg, "Login successful! Redirecting…", "success");
        setTimeout(() => { window.location.href = "index.html"; }, 900);
      } else {
        setMsg(msg, data.detail || "Invalid username or password.", "error");
      }
    })
    .catch(() => { btnLoading(btn, false); setMsg(msg, "Connection error. Is the server running?", "error"); });
}

function signupUser() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value;
  const btn = document.getElementById("signup-btn");
  const msg = document.getElementById("msg");

  if (!username || !password) { setMsg(msg, "Please fill in all fields.", "error"); return; }
  btnLoading(btn, true, "Creating account…");

  fetch(`${API_BASE}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(r => r.json())
    .then(data => {
      btnLoading(btn, false);
      if (data.message) {
        setMsg(msg, "Account created! Redirecting…", "success");
        setTimeout(() => { window.location.href = "login.html"; }, 1500);
      } else {
        setMsg(msg, data.error || "Signup failed. Try a different username.", "error");
      }
    })
    .catch(() => { btnLoading(btn, false); setMsg(msg, "Connection error.", "error"); });
}

function setMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = type;
  el.style.display = "block";
}

/* =========================================================
   UTILITIES
   ========================================================= */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getCookie(name) {
  let value = null;
  document.cookie.split(";").forEach(c => {
    c = c.trim();
    if (c.startsWith(name + "=")) value = decodeURIComponent(c.substring(name.length + 1));
  });
  return value;
}
