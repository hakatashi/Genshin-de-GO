export interface QuizConfig {
	kanji: string,
	answers: string[],
	prefix: string,
	suffix: string,
	yomiPrefix: string,
	yomiSuffix: string,
	category: string[],
	hint: 'length' | 'initial' | 'none',
	comment: string,
	isOfficial?: boolean,
	level: number,
}
