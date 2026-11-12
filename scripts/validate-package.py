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
assert (folder / "property-inspector/index.html").is_file()
assert len(manifest["Actions"]) == 6
uuids = [a["UUID"] for a in manifest["Actions"]]
assert len(set(uuids)) == len(uuids)
for item in ["Icon", "CategoryIcon"]:
    assert (folder / (manifest[item] + ".png")).is_file()
for action in manifest["Actions"]:
    assert (folder / (action["Icon"] + ".png")).is_file()
    assert (folder / action["PropertyInspectorPath"]).is_file()
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
