import assert from "node:assert";
import { module } from "./runner.js";
import "@byojs/matchall-starts-at";

export const test = module("string polyfill");

function matchIndexes(iterator) {
	return Array.from(iterator, m => m.index);
}

test("keeps native legacy default behavior", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("passes explicit 0 through to @@matchAll", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re, 0)),
		[ 1, 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("passes explicit non-zero offset through to @@matchAll", () => {
	var re = /a/g;

	re.lastIndex = 0;

	assert.deepEqual(
		matchIndexes("a-a-a-a".matchAll(re, 4)),
		[ 4, 6 ]
	);
	assert.equal(re.lastIndex, 0);
});

test("does not intercept undefined startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re, undefined)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("does not intercept NaN startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re, NaN)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("does not intercept Infinity startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re, Infinity)),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("does not intercept non-number startsAt", () => {
	var re = /a/g;

	re.lastIndex = 2;

	assert.deepEqual(
		matchIndexes("baaa".matchAll(re, "0")),
		[ 2, 3 ]
	);
	assert.equal(re.lastIndex, 2);
});

test("still supports string matcher argument", () => {
	assert.deepEqual(
		matchIndexes("baaa".matchAll("a")),
		[ 1, 2, 3 ]
	);
});

test("still throws for non-global regex", () => {
	assert.throws(
		() => Array.from("baaa".matchAll(/a/, 0)),
		TypeError
	);
});

test("passes finite startsAt to custom matcher", () => {
	var calls = [];
	var matcher = {
		[Symbol.matchAll](str, startsAt) {
			calls.push([ str, startsAt ]);
			return [][Symbol.iterator]();
		},
	};

	Array.from("baaa".matchAll(matcher, 2));

	assert.deepEqual(calls, [ [ "baaa", 2 ] ]);
});

test("does not pass non-finite startsAt to custom matcher", () => {
	var calls = [];
	var matcher = {
		[Symbol.matchAll](str, startsAt) {
			calls.push([ str, startsAt ]);
			return [][Symbol.iterator]();
		},
	};

	Array.from("baaa".matchAll(matcher, NaN));

	assert.deepEqual(calls, [ [ "baaa", undefined ] ]);
});
