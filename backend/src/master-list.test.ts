import test from "node:test";
import assert from "node:assert/strict";
import { parseServerListing } from "./master-list.js";

const html = `<table><tr><td>Other server</td><td>99/100</td><td>1.2.3.4:7777</td></tr><tr><td>[GER/DE] Böhmische Chroniken</td><td>20/2000</td><td>45.132.88.78:7777</td></tr></table>`;

test("reads only the configured server row", () => {
  const result = parseServerListing(html);
  assert.equal(result?.players, 20);
  assert.equal(result?.maxPlayers, 2000);
});

test("returns null when target is absent", () => {
  assert.equal(parseServerListing(html, "127.0.0.1:7777"), null);
});

test("rejects impossible counts", () => {
  assert.equal(parseServerListing('<tr><td>25/20</td><td>45.132.88.78:7777</td></tr>'), null);
});
