import sys
from pathlib import Path

# Adding api/ to pythonpath so that test can see all modules within (eg src.*)
sys.path.append(str(Path(__file__).resolve().parent))
