import sys
from pathlib import Path

# the code under test lives in the project folder, one level up
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
