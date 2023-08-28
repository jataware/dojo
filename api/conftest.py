import sys
from pathlib import Path
import os

# Adding api/ to pythonpath so that test can see all modules within (eg src.*)
sys.path.append(str(Path(__file__).resolve().parent))

# NOTE Example of how to patch things during tests, this global
#      fn would have to be called and passed this in
# def patch_env(monkeypatch):
#     monkeypatch.setenv("ELASTICSEARCH_URL", "http://localhost:8900")
#     monkeypatch.setenv("DMC_URL", "http://localhost:8901")
#     monkeypatch.setenv("DMC_USER", "test-user")
#     monkeypatch.setenv("DMC_PASSWORD", "password-heh")
#     monkeypatch.setenv("DMC_LOCAL_DIR", "./local-mock-dont-exist")
#     monkeypatch.setenv("REDIS_HOST", "moms-house")


# For now, there is no harm for current tests to patch all of these to be
# present, so that the settings validation passes
all_env_vars = ["ELASTICSEARCH_URL", "DMC_URL", "DMC_USER", "DMC_PASSWORD", "DMC_LOCAL_DIR", "REDIS_HOST"]

for item in all_env_vars:
    os.environ[item] = "1"

