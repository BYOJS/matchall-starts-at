import assert from "node:assert";
import { module } from "./runner.js";
import "@byojs/matchall-starts-at";

export const test = module("regexp polyfill");

function matchIndexes(iterator) {
	return Array.from(iterator, m => m.index);
}

test("keeps native legacy default behavior", () => {
	var re = /a/g;
	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa")),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("starts at explicit 0", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa", 0)),
		[ 1, 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("starts at explicit non-zero offset", () => {
	var re = /a/g;

	re.lastIndex = 0;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("a-a-a-a", 4)),
		[ 4, 6 ]
	);
	assert.equal(re.lastIndex, 0);
});

test("explicit start equal to lastIndex preserves behavior", () => {
	var re = /a/g;

	re.lastIndex = 4;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("a-a-a-a", 4)),
		[ 4, 6 ]
	);
	assert.equal(re.lastIndex, 4);
});

test("ignores undefined startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa", undefined)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("ignores NaN startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa", NaN)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("ignores Infinity startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa", Infinity)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("ignores non-number startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes(re[Symbol.matchAll]("baaa", "0")),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("direct @@matchAll supports non-global regex", () => {
	assert.deepEqual(
		matchIndexes(/a/[Symbol.matchAll]("baaa", 0)),
		[ 1 ]
	);
});
