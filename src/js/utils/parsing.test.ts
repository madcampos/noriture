import { describe, expect, test } from 'vitest';
import { parseXml } from './parsing.ts';

describe('XML parsing', () => {
	test('Empty string', () => {
		expect(parseXml('')).toThrow(RangeError);
		expect(parseXml('   ')).toThrow(RangeError);
	});

	test('Invalid XML', () => {
		expect(parseXml('<invalid>')).toThrow(SyntaxError);
	});

	test('Invalid root element', () => {
		expect(parseXml('<unknown></unknown>')).toThrow(TypeError);
	});

	test('RSS feed', () => {
		const rss = '<rss></rss>';
		const result = parseXml(rss);

		expect(result).toBeInstanceOf(XMLDocument);
		expect(result.querySelector('rss')).not.toBeNull();
	});

	test('Atom feed', () => {
		const feed = '<feed></feed>';
		const result = parseXml(feed);

		expect(result).toBeInstanceOf(XMLDocument);
		expect(result.querySelector('feed')).not.toBeNull();
	});

	test('Browserconfig', () => {
		const config = '<browserconfig></browserconfig>';
		const result = parseXml(config);

		expect(result).toBeInstanceOf(XMLDocument);
		expect(result.querySelector('browserconfig')).not.toBeNull();
	});
});
