import subprocess
import os
import tempfile
import time

def run_code(code, input_data=""):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.py') as temp:
            temp.write(code.encode())
            file_path = temp.name
        start_time = time.time()

        result = subprocess.run(
            ['python', file_path],
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
        return None, "Time Limit Exceeded", None
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)