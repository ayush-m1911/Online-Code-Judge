import subprocess
import tempfile
import os
import time

def run_code_docker(code, input_data=""):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            # Fix Windows path
            temp_dir = temp_dir.replace("\\", "/")

            file_path = os.path.join(temp_dir, "main.py")

            with open(file_path, "w") as f:
                f.write(code)

            start_time = time.time()

            result = subprocess.run(
                [
                    "docker", "run", "--rm",

                    # 🔐 Security limits
                    "--memory=100m",
                    "--cpus=0.5",
                    "--network=none",

                    # 📂 Mount code
                    "-v", f"{temp_dir}:/app",
                    "-w", "/app",

                    "python:3.11",
                    "python", "main.py"
                ],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=3
            )

            exec_time = round(time.time() - start_time, 4)

            return result.stdout.decode(), result.stderr.decode(), exec_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

def run_cpp_docker(code, input_data=""):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            temp_dir = temp_dir.replace("\\", "/")

            cpp_file = os.path.join(temp_dir, "main.cpp")

            with open(cpp_file, "w") as f:
                f.write(code)

            start_time = time.time()

            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "--memory=200m",
                    "--cpus=1",
                    "--network=none",
                    "-v", f"{temp_dir}:/app",
                    "-w", "/app",
                    "gcc:latest",
                    "bash", "-c",
                    "g++ main.cpp -o main && ./main"
                ],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5
            )

            exec_time = round(time.time() - start_time, 4)

            return result.stdout.decode(), result.stderr.decode(), exec_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

def run_java_docker(code, input_data=""):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            java_file = os.path.join(temp_dir, "Main.java")

            with open(java_file, "w") as f:
                f.write(code)

            start_time = time.time()

            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "-v", f"{temp_dir}:/app",
                    "-w", "/app",
                    "openjdk:17",
                    "bash", "-c",
                    "javac Main.java && java Main"
                ],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=3
            )

            exec_time = round(time.time() - start_time, 4)

            return result.stdout.decode(), result.stderr.decode(), exec_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

def run_cpp_docker(code, input_data=""):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:

            temp_dir = temp_dir.replace("\\", "/")

            cpp_file = os.path.join(temp_dir, "main.cpp")

            with open(cpp_file, "w") as f:
                f.write(code)

            start_time = time.time()

            result = subprocess.run(
                [
                    "docker", "run", "--rm",
                    "--memory=200m",
                    "--cpus=1",
                    "--network=none",
                    "-v", f"{temp_dir}:/app",
                    "-w", "/app",
                    "gcc:latest",
                    "bash", "-c",
                    "g++ main.cpp -o main && ./main"
                ],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=5
            )

            exec_time = round(time.time() - start_time, 4)

            return result.stdout.decode(), result.stderr.decode(), exec_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None