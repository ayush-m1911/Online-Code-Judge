# 🚀 CodeJudge – Online Coding Platform

CodeJudge is a full-stack online coding platform inspired by LeetCode, where users can solve programming problems, write code in multiple languages, and get instant feedback through automated evaluation.

---

## 🌐 Live Demo

🔗 **Frontend (Vercel):**
https://online-code-judge-seven.vercel.app/index.html

🔗 **Backend API (Render):**
https://online-code-judge.onrender.com/api/problems/

---

## 🧠 Features

* 📝 Solve coding problems with detailed descriptions
* 💻 Monaco Editor (VS Code-like experience)
* ⚡ Run code instantly (without evaluation)
* ✅ Submit solutions with verdicts:

  * Accepted (AC)
  * Wrong Answer (WA)
  * Time Limit Exceeded (TLE)
  * Runtime Error (RE)
  * Compilation Error (CE)
* 📊 Submission history tracking
* 🔐 User authentication (JWT-based login/signup)
* 🔍 Filter & search problems by difficulty and topic

---

## 🏗️ Tech Stack

### 🔹 Frontend

* HTML, CSS, JavaScript
* Monaco Editor
* Hosted on **Vercel**

### 🔹 Backend

* Django + Django REST Framework
* Code execution using `subprocess`
* JWT Authentication
* Hosted on **Render**

### 🔹 Database

* SQLite (development)

---

## ⚙️ How It Works

1. User selects a problem and writes code
2. Code is sent to backend via API
3. Backend executes code in a sandboxed environment
4. Output is compared with test cases
5. Verdict is returned and displayed on UI

---

## 🔐 Security (Current Approach)

* Keyword-based filtering to restrict dangerous operations
* Temporary sandbox directory for execution
* Execution timeout to prevent infinite loops

⚠️ Note: For production, container-based isolation (Docker) is recommended.

---

## 📌 Future Improvements

* PostgreSQL / NeonDB integration
* Docker-based secure code execution
* Async job queue (Celery + Redis)
* Leaderboard & ranking system
* Rate limiting & scaling

---

## 🧑‍💻 Author

**Ayush Metkar**
Passionate about building scalable systems and solving real-world problems through code.

---

## ⭐ Acknowledgment

This project was built to understand how real-world coding platforms work internally, including execution engines, API design, and full-stack integration.

---

## 💬 Interview Summary

> “I built a full-stack coding platform where users can solve problems and get real-time verdicts. The backend executes code securely using subprocess, while the frontend provides an interactive coding experience using Monaco Editor.”

---

⭐ If you like this project, feel free to star the repository!
