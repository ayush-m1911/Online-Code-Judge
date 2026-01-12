import subprocess
import tempfile
import os
import time

def run_code(code, input_data=""):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".py") as temp:
            temp.write(code.encode())
            file_path = temp.name

        start_time = time.time()

        result = subprocess.run(
            ["python", file_path],
            input=input_data.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=2
        )

        end_time = time.time()
        execution_time = round(end_time - start_time, 4)

        output = result.stdout.decode().strip()
        error = result.stderr.decode().strip()

        return output, error, execution_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
def run_cpp_code(code, input_data=""):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".cpp") as source_file:
            source_file.write(code.encode())
            source_file_path = source_file.name

        executable_path = source_file_path.replace('.cpp', '')

        compile_result = subprocess.run(
            ["g++", source_file_path, "-o", executable_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        if compile_result.returncode != 0:
            error = compile_result.stderr.decode().strip()
            return None, error, None

        start_time = time.time()

        result = subprocess.run(
            [executable_path],
            input=input_data.encode(),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=2
        )

        end_time = time.time()
        execution_time = round(end_time - start_time, 4)

        output = result.stdout.decode().strip()
        error = result.stderr.decode().strip()

        return output, error, execution_time

    except subprocess.TimeoutExpired:
        return None, "TLE", None

    finally:
        if os.path.exists(source_file_path):
            os.remove(source_file_path)
        if os.path.exists(executable_path):
            os.remove(executable_path)

def run_java_code(code, input_data=""):
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            source_file_path = os.path.join(temp_dir, "Main.java")
            with open(source_file_path, 'w') as source_file:
                source_file.write(code)

            compile_result = subprocess.run(
                ["javac", source_file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            if compile_result.returncode != 0:
                error = compile_result.stderr.decode().strip()
                return None, error, None

            start_time = time.time()

            result = subprocess.run(
                ["java", "-cp", temp_dir, "Main"],
                input=input_data.encode(),
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=2
            )

            end_time = time.time()
            execution_time = round(end_time - start_time, 4)

            output = result.stdout.decode().strip()
            error = result.stderr.decode().strip()

            return output, error, execution_time
        
    except subprocess.TimeoutExpired:
        return None, "TLE", None