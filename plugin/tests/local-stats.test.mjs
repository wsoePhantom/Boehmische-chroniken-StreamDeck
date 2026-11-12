import test from "node:test";
import assert from "node:assert/strict";
import { parseListing } from "../dist/local-stats-test.mjs";

test("reads only the configured KCD:MP server row", () => {
  const html = `<table><tr><td>Other</td><td>1.2.3.4:7777</td><td>99/100</td></tr>
    <tr><td>Böhmische Chroniken</td><td>45.132.88.78:7777</td><td>14/2000</td></tr></table>`;
  assert.deepEqual(parseListing(html), { players: 14, maximum: 2000 });
});
test("does not attribute other servers' players to this server", () => {
  assert.equal(parseListing("<tr><td>Other</td><td>99/100</td></tr>"), null);
});
test("rejects malformed and impossible player counts", () => {
  assert.equal(parseListing("<tr><td>45.132.88.78:7777</td><td>201/200</td></tr>"), null);
  assert.equal(parseListing("<tr><td>45.132.88.78:7777</td><td>not available</td></tr>"), null);
});
test("rejects ambiguous multiple player-count cells", () => {
  assert.equal(parseListing("<tr><td>45.132.88.78:7777</td><td>14/2000</td><td>5/50</td></tr>"), null);
});
