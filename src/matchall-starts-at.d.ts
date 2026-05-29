export {};

declare global {
	interface RegExp {
		[Symbol.matchAll](str: string, startsAt?: number): RegExpStringIterator<RegExpExecArray>;
	}

	interface String {
		matchAll(regexp: RegExp, startsAt?: number): RegExpStringIterator<RegExpExecArray>;
	}
}
