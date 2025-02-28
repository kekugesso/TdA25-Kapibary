import multiprocessing
import subprocess

from django.apps import AppConfig

from .queue import queue_process


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        result = subprocess.run(
            "ps -fa | grep python | grep back | grep -v .venv | awk '{print $2}'",
            shell=True,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )

        # Capture output and handle errors
        if result.returncode == 0 and len(result.stdout.strip().splitlines()) < 2:
            multiprocessing.Process(target=queue_process, daemon=True).start()
        else:
            print(
                "ERROR: the process is already running or exited with non zero exit code")
