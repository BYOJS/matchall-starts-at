# @byojs/matchall-starts-at

A BYOJS prollyfill adding explicit start-position support to JavaScript's regex match iteration APIs.

JavaScript's native `String.prototype.matchAll(..)` already clones a supplied `RegExp` internally, but it also copies the regex's current `lastIndex` onto that clone. That preserves legacy regex cursor behavior, but it means `matchAll(..)` is still vulnerable to unexpected regex state.

This package preserves the existing default behavior, while adding an explicit `startsAt` parameter; to get a fresh, starting-from-the-beginning behavior, always pass `0` as the second argument:

```js
import "@byojs/matchall-starts-at";

var re = /a/g;
re.lastIndex = 2;

[..."baaa".matchAll(re)].map(m => m.index);    // [ 2, 3 ]

[..."baaa".matchAll(re,0)].map(m => m.index);  // [ 1, 2, 3 ]

[..."baaa".matchAll(re,3)].map(m => m.index);  // [ 3 ]
```

This is not a polyfill, in that there's currently no standards track proposal to add this to JS (**BUT THERE SHOULD BE!**).

It's a **prollyfill**: a speculative API improvement -- suggestion, future proposed polyfill -- for codebases that want a more explicit match-iteration cursor.

## Why?

Native `matchAll(..)` effectively behaves like this:

```js
var clone = new RegExp(re);
clone.lastIndex = re.lastIndex;
```

This package gives you an explicit way to choose the starting position without mutating the original regex:

```js
var clone = new RegExp(re);
clone.lastIndex = startsAt;
```

So this:

```js
str.matchAll(re,0)
```

is the convenient equivalent of:

```js
var clone = new RegExp(re);
clone.lastIndex = 0;

str.matchAll(clone);
```

## Usage

Import the package (only needed once since it patches global prototypes):

```js
import "@byojs/matchall-starts-at";
```

After import, both APIs accept an optional finite-number `startsAt` argument:

```js
str.matchAll(re,startsAt);
re[Symbol.matchAll](str,startsAt);
```

The existing one-argument behavior is preserved; **existing one-argument calls keep their native-compatible behavior**.

```js
var re = /a/g;
re.lastIndex = 2;

[..."baaa".matchAll(re)].map(m => m.index);
// [ 2, 3 ]

re.lastIndex;
// 2
```

To ignore a polluted `lastIndex` and start from the beginning, pass `0` for the second argument:

```js
var re = /a/g;
re.lastIndex = 2;

[..."baaa".matchAll(re,0)].map(m => m.index);
// [ 1, 2, 3 ]

re.lastIndex;
// 2
```

To start at another explicit offset:

```js
[..."a-a-a-a".matchAll(/a/g,4)].map(m => m.index);
// [ 4, 6 ]
```

## Behavior

This package patches:

```js
RegExp.prototype[Symbol.matchAll]

String.prototype.matchAll
```

It only activates the new behavior when `startsAt` is a finite number:

```js
"baaa".matchAll(/a/g,0);         // explicit startsAt
"baaa".matchAll(/a/g,2);         // explicit startsAt

"baaa".matchAll(/a/g);           // native-compatible behavior
"baaa".matchAll(/a/g,undefined); // native-compatible behavior
"baaa".matchAll(/a/g,NaN);       // native-compatible behavior
"baaa".matchAll(/a/g,Infinity);  // native-compatible behavior
"baaa".matchAll(/a/g,"0");      // native-compatible behavior
```

This narrower behavior is intentional. It avoids claiming arbitrary future second-argument shapes that JavaScript may eventually define.

That narrow activation is the main reason this package can justify patching global prototypes despite the usual "don't touch globals" rule.

### Error on non `/g` regular expressions

Non-global regex behavior for `String.prototype.matchAll(..)` is preserved:

```js
"abc".matchAll(/a/,0); // TypeError, same as native matchAll(..)
```

The direct `RegExp.prototype[Symbol.matchAll](..)` path follows the platform's lower-level behavior.

## Caution

This package intentionally modifies built-in prototypes.

That is appropriate for application code and controlled runtimes that deliberately opt into this behavior. It should not be imported by libraries that run inside other people's applications.

## TypeScript Support

Type definitions for the patched/prolyfilled native prototype methods (`RegExp.prototype[Symbol.matchAll]` and `String.prototype.matchAll()`) are bundled with the package (in an external `.d.ts` file).

TypeScript projects will pick the definitions up automatically; no separate `@types/` install needed.

## Tests

A test suite is included in this repository, as well as the npm package distribution. The default test behavior runs the test suite using the files in `src/`.

To run the test suite:

```cmd
npm test
```

## License

[![License](https://img.shields.io/badge/license-MIT-a1356a)](LICENSE.txt)

All code and documentation are (c) 2026 Kyle Simpson and released under the [MIT License](http://getify.mit-license.org/). A copy of the MIT License [is also included](LICENSE.txt).
