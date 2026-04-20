import subprocess
import tempfile
import os
import sys

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


def _prepare_run_command(code, language, tmpdir):
    if language == 'python':
        file_path = os.path.join(tmpdir, 'solution.py')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        python_cmd = 'python' if sys.platform == 'win32' else 'python3'
        return [python_cmd, '-I', file_path], None

    if language == 'cpp':
        file_path = os.path.join(tmpdir, 'main.cpp')
        exe_path = os.path.join(tmpdir, 'main.out')
        if sys.platform == 'win32':
            exe_path += '.exe'
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        result = subprocess.run(
            ['g++', '-O2', '-o', exe_path, file_path],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            return None, f"Ошибка компиляции C++:\n{result.stderr[:500]}"
        return [exe_path], None

    if language == 'java':
        file_path = os.path.join(tmpdir, 'Main.java')
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(code)
        result = subprocess.run(
            ['javac', file_path],
            capture_output=True, text=True, timeout=15
        )
        if result.returncode != 0:
            return None, f"Ошибка компиляции Java:\n{result.stderr[:500]}"
        return ['java', '-cp', tmpdir, 'Main'], None

    return None, f"Неизвестный язык: {language}"


def run_submission(submission):
    if len(submission.code.encode('utf-8')) > MAX_CODE_SIZE_BYTES:
        return "Runtime Error", f"Код слишком большой. Максимум {MAX_CODE_SIZE_BYTES // 1024} KB."

    test_cases = submission.problem.test_cases.all()
    if not test_cases:
        return "Runtime Error", "Админ ещё не добавил тесты для этой задачи."

    for index, test in enumerate(test_cases, 1):
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                run_command, error = _prepare_run_command(submission.code, submission.language, tmpdir)
                if error:
                    return "Runtime Error", error

                run_kwargs = {
                    'input': test.input_data,
                    'text': True,
                    'capture_output': True,
                    'timeout': 2,
                    'env': SAFE_ENV,
                    'close_fds': True,
                }
                if sys.platform != 'win32':
                    run_kwargs['preexec_fn'] = _apply_resource_limits

                process = subprocess.run(run_command, **run_kwargs)

                if process.returncode != 0:
                    return "Runtime Error", f"Ошибка выполнения на тесте #{index}:\n{process.stderr[:300]}"

                if process.stdout[:10_000].strip() != test.expected_output.strip():
                    return (
                        "Wrong Answer",
                        f"Тест #{index} не пройден.\n"
                        f"Ожидалось: '{test.expected_output.strip()}'\n"
                        f"Получено:  '{process.stdout[:10_000].strip()}'"
                    )

        except subprocess.TimeoutExpired:
            return "Time Limit Exceeded", f"Тест #{index}: превышено время ожидания (2 сек)."
        except Exception as e:
            return "Runtime Error", f"Системная ошибка: {str(e)}"

    return "Accepted", "Все тесты пройдены успешно!"


def run_code_with_input(code, language, stdin):
    if len(code.encode('utf-8')) > MAX_CODE_SIZE_BYTES:
        return False, f"Код слишком большой. Максимум {MAX_CODE_SIZE_BYTES // 1024} KB."

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            run_command, error = _prepare_run_command(code, language, tmpdir)
            if error:
                return False, error

            run_kwargs = {
                'input': stdin or '',
                'text': True,
                'capture_output': True,
                'timeout': 5,
                'env': SAFE_ENV,
                'close_fds': True,
            }
            if sys.platform != 'win32':
                run_kwargs['preexec_fn'] = _apply_resource_limits

            process = subprocess.run(run_command, **run_kwargs)
            if process.returncode != 0:
                return False, process.stderr[:500] or "Runtime Error"

            return True, process.stdout[:10_000]

    except subprocess.TimeoutExpired:
        return False, "Превышено время выполнения (5 сек)."
    except Exception as e:
        return False, f"Системная ошибка: {str(e)}"
