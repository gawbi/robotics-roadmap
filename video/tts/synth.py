"""Speak a video's narration with MeloTTS's Korean voice (MIT licence, runs on this machine).

Reads tts/jobs/<id>.json (node export-speech.mjs <id>), writes public/audio/<id>/<scene>-<cue>.wav and
src/lessons/<id>.narration.json with each line's length, which the video uses to fit its scenes to the voice.

usage: tts/.venv/bin/python tts/synth.py behavior-cloning [more ids]
"""

import json
import sys
import types
import wave
from pathlib import Path

# MeloTTS imports every language's text module up front. The Japanese one needs mecab-python3, whose MeCab/ folder
# collides with python-mecab-ko's mecab/ (which the Korean G2P needs) on macOS's case-insensitive disk, so the
# languages this script never speaks are stubbed out before melo loads.
def _unused(module: str) -> types.ModuleType:
    """a stand-in whose every name is a function that refuses to run: melo imports them, Korean never calls them"""
    stub = types.ModuleType(module)

    def missing(name: str):
        if name.startswith("__"):
            raise AttributeError(name)

        def refuse(*_args, **_kwargs):
            raise NotImplementedError(f"{module}.{name} is not available in this Korean-only setup")

        return refuse

    stub.__getattr__ = missing  # type: ignore[attr-defined]
    return stub


for _lang in ("chinese", "japanese", "english", "chinese_mix", "french", "spanish"):
    sys.modules[f"melo.text.{_lang}"] = _unused(f"melo.text.{_lang}")

from melo.api import TTS  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
SPEED = 1.05  # a little brisker than the model's default


def main(ids: list[str]) -> None:
    tts = TTS(language="KR", device="auto")
    speaker = tts.hps.data.spk2id["KR"]
    for vid in ids:
        job = json.loads((ROOT / "tts" / "jobs" / f"{vid}.json").read_text(encoding="utf-8"))
        out = ROOT / "public" / "audio" / vid
        out.mkdir(parents=True, exist_ok=True)
        lengths: dict[str, float] = {}
        for line in job["lines"]:
            path = out / f"{line['key']}.wav"
            tts.tts_to_file(line["text"], speaker, str(path), speed=SPEED, quiet=True)
            with wave.open(str(path)) as w:
                lengths[line["key"]] = round(w.getnframes() / w.getframerate(), 3)
            print(f"{line['key']}: {lengths[line['key']]:.2f}s  {line['text']}")
        target = ROOT / "src" / "lessons" / f"{vid}.narration.json"
        target.write_text(json.dumps(lengths, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1:])
