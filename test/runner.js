import path from "node:path";
import fsp from "node:fs/promises";
import { fileURLToPath } from "node:url";

export { module };


module.only = function onlyModule(name) {
	return makeModule(
		name,
		/*forceModuleOnly=*/true,
		/*forceIgnoreOnly=*/false
	);
};

module.ignore = function ignoreModule(name) {
	return makeModule(
		name,
		/*forceModuleOnly=*/false,
		/*forceIgnoreOnly=*/true
	);
};


run().catch(console.error);


// ************************

async function run() {
	var tests = [];
	var moduleOnlyTests = [];
	var onlyTests = [];

	var runnerPath = fileURLToPath(import.meta.url);
	var testDir = path.dirname(runnerPath);

	var files = (await fsp.readdir(testDir))
		.filter(f => f.endsWith(".js") && path.resolve(testDir,f) !== runnerPath)
		.sort();

	for (let file of files) {
		let { test: fixture } = await import(path.join(testDir,file));
		fixture?.run(tests,onlyTests,moduleOnlyTests);
	}

	var suite = (
		onlyTests.length > 0 ? onlyTests :
		moduleOnlyTests.length > 0 ? moduleOnlyTests :
		tests
	);
	var passed = 0;
	var failed = 0;
	var lastModule = "";

	for (let { name, fn } of suite) {
		let [ mod, ...rest ] = name.split(" > ");
		if (mod !== lastModule) {
			console.log(`\n${mod}`);
			lastModule = mod;
		}
		try {
			await fn();
			console.log(`  ✓ ${rest.join(" > ")}`);
			passed++;
		}
		catch (err) {
			console.log(`  ✗ ${rest.join(" > ")}`);
			console.log(`    ${err.message.replaceAll("[Object: null prototype] ","")}`);
			failed++;
		}
	}

	console.log(`\n${passed} passed, ${failed} failed`);
	process.exit(failed > 0 ? 1 : 0);
}

function makeModule(name, forceModuleOnly, forceIgnore) {
	var queue = [];

	function test(testName, fn) {
		if (!forceIgnore) {
			queue.push({ name: `${name} > ${testName}`, fn, moduleOnly: forceModuleOnly, });
		}
	}

	test.only = function only(testName, fn) {
		if (!forceIgnore) {
			queue.push({ name: `${name} > ${testName}`, fn, testOnly: true, });
		}
	};

	test.ignore = function ignore(testName, fn) {
		// no-op
	};

	test.run = function run(tests, onlyTests, moduleOnlyTests) {
		for (let entry of queue) {
			if (entry.testOnly) onlyTests.push(entry);
			if (entry.moduleOnly) moduleOnlyTests.push(entry);
			if (!(entry.testOnly || entry.moduleOnly)) tests.push(entry);
		}
	};

	return test;
}

function module(name) {
	return makeModule(name, false, false);
}
