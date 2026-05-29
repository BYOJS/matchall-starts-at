var PATCHED = Symbol.for("@byojs/matchall-starts-at");

if (!String.prototype.matchAll[PATCHED]) {
	var nativeStringMatchAll = String.prototype.matchAll;
	var nativeRegExpMatchAll = RegExp.prototype[Symbol.matchAll];

	function regExpMatchAll(str,startsAt = this.lastIndex) {
		var re = this;
		if (Number.isFinite(startsAt) && startsAt !== re.lastIndex) {
			re = new RegExp(re);
			re.lastIndex = startsAt;
		}
		return nativeRegExpMatchAll.call(re,str);
	}

	function stringMatchAll(matcher,startsAt) {
		if (
			Number.isFinite(startsAt) &&
			matcher != null &&
			typeof matcher[Symbol.matchAll] == "function"
		) {
			if (
				isRegExp(matcher) &&
				!matcher.global
			) {
				return nativeStringMatchAll.call(this,matcher);
			}

			return matcher[Symbol.matchAll](this,startsAt);
		}
		return nativeStringMatchAll.call(this,matcher);
	}

	function isRegExp(v) {
		return Object.prototype.toString.call(v) == "[object RegExp]";
	}

	regExpMatchAll[PATCHED] = true;
	stringMatchAll[PATCHED] = true;

	RegExp.prototype[Symbol.matchAll] = regExpMatchAll;
	String.prototype.matchAll = stringMatchAll;
}
