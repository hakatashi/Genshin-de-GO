import assert from 'assert';
import {stripIndent} from 'common-tags';
import {z} from 'zod';
import type {QuizConfig} from '../src/lib/types';

const levelSchema = z.number().int().gte(0).lte(4);

const entrySchema = z.object({
	kanji: z.string(),
	yomi: z.union([
		z.string(),
		z.string().array().nonempty(),
	]),
	level: z.union([
		levelSchema,
		levelSchema.array().nonempty(),
	]).optional(),
	comment: z.string().default(''),
	isOfficial: z.boolean().default(false),
	ref: z.string().array().default([]),
	hint: z.enum(['length', 'initial', 'none'] as const).default('none'),
	note: z.string().default(''),
}).strict();

export type Entry = z.infer<typeof entrySchema>;

type Terms = {
	[key: string]: Entry[] | Terms;
}

export const termsSchema: z.ZodType<Terms> = z.record(z.lazy(() => z.union([
	entrySchema.array().nonempty(),
	termsSchema,
])));

interface ParenDivision {
	parenMatches: string[],
	nonParenMatches: string[],
}

const generateKanjiAnswerPair = (kanji: ParenDivision, yomis: ParenDivision[], i: number) => {
	const primaryYomi = yomis[0];

	let prefix = '';
	let suffix = '';
	let yomiPrefix = '';
	let yomiSuffix = '';

	for (const j of kanji.nonParenMatches.keys()) {
		if (j <= i) {
			if (j !== 0) {
				prefix += kanji.parenMatches[j - 1];
				yomiPrefix += primaryYomi.parenMatches[j - 1].split('、')[0];
			}
			prefix += kanji.nonParenMatches[j];
			yomiPrefix += primaryYomi.nonParenMatches[j];
		}

		if (j > i) {
			suffix += kanji.nonParenMatches[j];
			yomiSuffix += primaryYomi.nonParenMatches[j];
			if (j !== kanji.nonParenMatches.length - 1) {
				suffix += kanji.parenMatches[j];
				yomiSuffix += primaryYomi.parenMatches[j].split('、')[0];
			}
		}
	}

	const answers = yomis.flatMap((yomi) => yomi.parenMatches[i].split('、'));

	return {
		kanji: kanji.parenMatches[i],
		answers,
		prefix,
		suffix,
		yomiPrefix,
		yomiSuffix,
	};
};

const compileEntry = (entry: Entry, category: string[]) => {
	if (entry.level === undefined) {
		return null;
	}

	const yomis = Array.isArray(entry.yomi) ? entry.yomi : [entry.yomi];
	const levels = Array.isArray(entry.level) ? entry.level : [entry.level];

	for (const yomi of yomis) {
		if (yomi === '') {
			throw new Error(stripIndent`
				読みが空です。
				漢字: ${entry.kanji}
			`);
		}
	}

	const kanjiMatches = {
		parenMatches: Array.from(
			entry.kanji.matchAll(/\((?<subgroup>.+?)\)/g),
			(match) => match.groups?.subgroup ?? '',
		),
		nonParenMatches: entry.kanji.split(/\(.+?\)/g),
	};

	assert.strictEqual(
		kanjiMatches.parenMatches.length + 1,
		kanjiMatches.nonParenMatches.length,
	);

	const yomiMatches = yomis.map((yomi) => {
		const parenMatches = Array.from(
			yomi.matchAll(/\((?<subgroup>.+?)\)/g),
			(match) => match.groups?.subgroup ?? '',
		);
		const nonParenMatches = yomi.split(/\(.+?\)/g);
		assert.strictEqual(
			parenMatches.length + 1,
			nonParenMatches.length,
		);
		return {parenMatches, nonParenMatches};
	});

	const parenCount = kanjiMatches.parenMatches.length;

	if (yomiMatches.some((
		(match) => match.parenMatches.length !== parenCount
	))) {
		throw new Error(stripIndent`
			カッコで囲まれた読みの数が漢字と一致しません。
			漢字: ${entry.kanji}
			読み: ${yomis}
		`);
	}

	if (parenCount !== 0 && levels.length !== parenCount) {
		throw new Error(stripIndent`
			カッコで囲まれた漢字の数がレベルの数と一致しません。
			漢字: ${entry.kanji}
			レベル: [${levels.join(', ')}]
		`);
	}

	if (parenCount === 0 && levels.length !== 1) {
		throw new Error(stripIndent`
			カッコで囲まれた漢字がないのにレベルが複数あります。
			漢字: ${entry.kanji}
			レベル: [${levels.join(', ')}]
		`);
	}

	if (entry.comment === '') {
		throw new Error(stripIndent`
			コメントが空です。
			漢字: ${entry.kanji}
		`);
	}

	const quizzes: QuizConfig[] = [];

	if (parenCount === 0) {
		quizzes.push({
			kanji: entry.kanji,
			answers: yomis,
			prefix: '',
			suffix: '',
			yomiPrefix: '',
			yomiSuffix: '',
			category,
			comment: entry.comment,
			hint: entry.hint,
			level: levels[0],
			isOfficial: entry.isOfficial,
		});
	} else {
		for (const i of Array(parenCount).keys()) {
			quizzes.push({
				...generateKanjiAnswerPair(kanjiMatches, yomiMatches, i),
				category,
				comment: entry.comment,
				hint: entry.hint,
				level: levels[i],
				isOfficial: entry.isOfficial,
			});
		}
	}

	for (const quiz of quizzes) {
		for (const answer of quiz.answers) {
			if (!answer.match(/^[ぁ-んー]+$/)) {
				throw new Error(stripIndent`
					読みにひらがな以外の文字が含まれています。
					漢字: ${quiz.kanji}
					読み: ${quiz.answers}
				`);
			}
		}

		if (quiz.kanji.match(/^[ぁ-んー]+$/)) {
			throw new Error(stripIndent`
				漢字にひらがなが含まれています。
				漢字: ${quiz.kanji}
				読み: ${quiz.answers}
			`);
		}
	}

	return quizzes;
};

export const getEntries = (terms: Terms, category: string[]) => {
	const entries: (Entry & {category: string[]})[] = [];

	for (const [key, value] of Object.entries(terms)) {
		const newCategory = [...category, key];
		if (Array.isArray(value)) {
			entries.push(...value.map((entry) => ({...entry, category: newCategory})));
		} else {
			entries.push(...getEntries(value, newCategory));
		}
	}

	return entries;
};

export const getCompiledTerms = (terms: Terms, category: string[]) => {
	const entries = getEntries(terms, category);
	const quizzes: QuizConfig[] = [];

	for (const entry of entries) {
		const compiledQuizzes = compileEntry(entry, entry.category);
		if (compiledQuizzes !== null) {
			quizzes.push(...compiledQuizzes);
		}
	}

	return quizzes;
};
