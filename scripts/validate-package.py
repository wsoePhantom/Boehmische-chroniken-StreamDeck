"""Validate the assembled Stream Deck bundle before publishing it."""
import json
from pathlib import Path
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
folder = root / "build/de.boehmischechroniken.stats.sdPlugin"
manifest = json.loads((folder / "manifest.json").read_text(encoding="utf-8"))
assert manifest["SDKVersion"] == 2
assert manifest["CodePath"] == "plugin.js"
assert (folder / manifest["CodePath"]).stat().st_size > 0
assert len(manifest["Actions"]) == 4
assert manifest["Version"] == "1.0.1.0"
assert manifest["Nodejs"]["Version"] == "20"
assert {a["UUID"].rsplit(".", 1)[-1] for a in manifest["Actions"]} == {"status", "players", "record", "history"}
uuids = [a["UUID"] for a in manifest["Actions"]]
assert len(set(uuids)) == len(uuids)
for item in ["Icon", "CategoryIcon"]:
    assert (folder / (manifest[item] + ".png")).is_file()
for action in manifest["Actions"]:
    assert (folder / (action["Icon"] + ".png")).is_file()
    for state in action["States"]:
        assert (folder / (state["Image"] + ".png")).is_file()
archive = root / "build/Boehmische-Chroniken.streamDeckPlugin"
with ZipFile(archive) as zipped:
    assert zipped.testzip() is None
    names = set(zipped.namelist())
    prefix = folder.name + "/"
    assert prefix + "manifest.json" in names
    assert prefix + "plugin.js" in names
print("Bundle structure and archive integrity: OK")
