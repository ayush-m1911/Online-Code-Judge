import subprocess
import tempfile
import os
import time
DANGEROUS_KEYWORDS = ["os.system", "subprocess", "shutil", "open(", "import os", "import sys"]

def is_code_safe(code):
    for keyword in DANGEROUS_KEYWORDS:
        if keyword in code:
            return False
    return True

def run_code(code, input_data=""):
    try:
        if not is_code_safe(code):
         return None, "Security Violation: Restricted operation", None

        with tempfile.TemporaryDirectory() as sandbox:
            file_path = os.path.join(sandbox, "main.py")

            with open(file_path, "w") as f:
                f.write(code)

            start_time = time.time()

            result = subprocess.run(
                ["python", "main.py"],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=2,
                cwd=sandbox  # 👈 isolate working directory
            )

            end_time = time.time()
            execution_time = round(end_time - start_time, 4)

            output = result.stdout.decode().strip()
            error = result.stderr.decode().strip()

            return output, error, execution_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

def run_cpp_code(code, input_data=""):
    try:
        if not is_code_safe(code):
         return None, "Security Violation: Restricted operation", None

        with tempfile.TemporaryDirectory() as sandbox:
            src_path = os.path.join(sandbox, "main.cpp")
            exe_path = os.path.join(sandbox, "main")

            with open(src_path, "w") as f:
                f.write(code)

            compile_result = subprocess.run(
                ["g++", src_path, "-o", exe_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=sandbox
            )

            if compile_result.returncode != 0:
                return None, compile_result.stderr.decode().strip(), None

            start_time = time.time()

            run_result = subprocess.run(
                [exe_path],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=2,
                cwd=sandbox
            )

            end_time = time.time()
            execution_time = round(end_time - start_time, 4)

            output = run_result.stdout.decode().strip()
            error = run_result.stderr.decode().strip()

            return output, error, execution_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None


def run_java_code(code, input_data=""):
    try:
        if not is_code_safe(code):
         return None, "Security Violation: Restricted operation", None

        with tempfile.TemporaryDirectory() as sandbox:
            java_file = os.path.join(sandbox, "Main.java")

            with open(java_file, "w") as f:
                f.write(code)

            compile_result = subprocess.run(
                ["javac", "Main.java"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                cwd=sandbox
            )

            if compile_result.returncode != 0:
                return None, compile_result.stderr.decode().strip(), None

            start_time = time.time()

            run_result = subprocess.run(
                ["java", "-cp", sandbox, "Main"],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=2,
                cwd=sandbox
            )

            end_time = time.time()
            execution_time = round(end_time - start_time, 4)

            output = run_result.stdout.decode().strip()
            error = run_result.stderr.decode().strip()

            return output, error, execution_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None
