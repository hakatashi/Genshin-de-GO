import assert from 'assert';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import klaw from 'klaw';
import {countBy} from 'lodash';
import type {QuizConfig} from '../src/lib/types';
import {getCompiledTerms, termsSchema} from './lib/dictionary';

(async () => {
	const quizzes: QuizConfig[] = [];

	for await (const file of klaw('data/terms')) {
		if (!file.path.endsWith('.yml')) {
			continue;
		}

		const contents = await fs.readFile(file.path, 'utf8');
		const terms = yaml.load(contents);

		const parsedTerms = termsSchema.parse(terms);
		quizzes.push(...getCompiledTerms(parsedTerms, []));
	}

	assert(quizzes.length > 0, 'No quizzes were found.');

	const dictionary = JSON.stringify(quizzes.toSorted((a, b) => a.level - b.level), null, '  ');

	console.log(`Built ${quizzes.length} quizzes.`);

	console.log(countBy(quizzes, (quiz) => quiz.level));

	await fs.writeFile('data/dictionary.json', dictionary);
})();
