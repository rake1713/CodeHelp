import subprocess
import tempfile
import os
import sys

# Пытаемся импортировать resource только если мы НЕ на Windows
if sys.platform != 'win32':
    import resource
else:
    resource = None
    
MAX_CODE_SIZE_BYTES = 64 * 1024

SAFE_ENV = {
    'PATH': '/usr/local/bin:/usr/bin:/bin',
    'HOME': '/tmp',
    'LANG': 'en_US.UTF-8',
}


def _apply_resource_limits():
    if resource is not None:
        resource.setrlimit(resource.RLIMIT_CPU, (5, 5))
        resource.setrlimit(resource.RLIMIT_FSIZE, (10 * 1024 * 1024, 10 * 1024 * 1024))
        os.setpgrp()


def run_submission(submission):
    if len(submission.code.encode('utf-8')) > MAX_CODE_SIZE_BYTES:
        return "Error", f"Код слишком большой. Максимум {MAX_CODE_SIZE_BYTES // 1024} KB."

    problem = submission.problem
    test_cases = problem.test_cases.all()

    if not test_cases:
        return "No Test Cases", "Админ ещё не добавил тесты для этой задачи."

    for index, test in enumerate(test_cases, 1):
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                if submission.language == 'python':
                    file_path = os.path.join(tmpdir, "solution.py")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(submission.code)
                    run_command = ['python3', '-I', file_path]

                elif submission.language == 'cpp':
                    file_path = os.path.join(tmpdir, "main.cpp")
                    exe_path = os.path.join(tmpdir, "main.out")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(submission.code)

                    compile_res = subprocess.run(
                        ['g++', '-O2', '-o', exe_path, file_path],
                        capture_output=True, text=True, timeout=10
                    )
                    if compile_res.returncode != 0:
                        return "Runtime Error", f"Ошибка компиляции C++:\n{compile_res.stderr[:500]}"
                    run_command = [exe_path]

                elif submission.language == 'java':
                    file_path = os.path.join(tmpdir, "Main.java")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(submission.code)

                    compile_res = subprocess.run(
                        ['javac', file_path],
                        capture_output=True, text=True, timeout=15
                    )
                    if compile_res.returncode != 0:
                        return "Runtime Error", f"Ошибка компиляции Java:\n{compile_res.stderr[:500]}"
                    run_command = ['java', '-cp', tmpdir, 'Main']

                else:
                    return "Error", f"Неизвестный язык: {submission.language}"

                process = subprocess.run(
                    run_command,
                    input=test.input_data,
                    text=True,
                    capture_output=True,
                    timeout=2,
                    env=SAFE_ENV,
                    close_fds=True,
                    preexec_fn=_apply_resource_limits,
                )

                stdout = process.stdout[:10_000]

                if process.returncode != 0:
                    stderr_preview = process.stderr[:300]
                    return "Runtime Error", f"Ошибка выполнения на тесте #{index}:\n{stderr_preview}"

                user_output = stdout.strip()
                expected_output = test.expected_output.strip()

                if user_output != expected_output:
                    return (
                        "Wrong Answer",
                        f"Тест #{index} не пройден.\n"
                        f"Ожидалось: '{expected_output}'\n"
                        f"Получено:  '{user_output}'"
                    )

        except subprocess.TimeoutExpired:
            return "Time Limit Exceeded", f"Тест #{index}: превышено время ожидания (2 сек)."
        except Exception as e:
            return "Error", f"Системная ошибка: {str(e)}"

    return "Accepted", "Все тесты пройдены успешно!"
