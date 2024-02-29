import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import chalk from 'chalk';
import yaml from 'js-yaml';
import klaw from 'klaw';
import {sampleSize} from 'lodash';
import storage from 'node-persist';
import RegexEscape from 'regex-escape';
import {z} from 'zod';
import {Entry, getEntries, termsSchema} from './lib/dictionary';

const fetchAmbr = async (apiPath: string, lang = 'jp') => {
	const url = `https://api.ambr.top/v2/${lang}${apiPath}`;
	const cacheId = `ambr:${apiPath}`;
	const cached = await storage.getItem(cacheId);

	if (cached) {
		return cached;
	}

	await new Promise((resolve) => {
		setTimeout(resolve, 3000);
	});

	const response = await axios.get(url);
	const data = response.data;
	await storage.setItem(cacheId, data);

	return data;
};

const avatarSchema = z.object({
	response: z.literal(200),
	data: z.object({
		items: z.record(z.object({
			id: z.union([z.string(), z.number()]),
			birthday: z.tuple([z.number(), z.number()]),
			name: z.string(),
			rank: z.number(),
			element: z.string(),
			weaponType: z.string(),
		})),
	}),
});

const avatarDetailsSchema = z.object({
	response: z.literal(200),
	data: z.object({
		other: z.object({
			furnitureId: z.number(),
		}).nullable(),
	}),
});

const avatarFetterSchema = z.object({
	response: z.literal(200),
	data: z.object({
		quotes: z.record(z.object({
			audio: z.string(),
			text: z.string(),
			tips: z.string(),
			title: z.string(),
		})),
		story: z.record(z.object({
			text: z.string(),
			text2: z.string().nullable(),
			tips: z.string(),
			title: z.string(),
			title2: z.string().nullable(),
		})),
	}),
});

const furnitureSchema = z.object({
	response: z.literal(200),
	data: z.object({
		story: z.record(z.object({
			id: z.number(),
			taskData: z.array(z.object({
				beginCond: z.array(z.object({
					condition: z.string(),
					furnitureSuitName: z.string().optional(),
				})).nullable(),
				initDialog: z.number(),
				items: z.record(z.object({
					role: z.string(),
					text: z.array(z.object({
						next: z.union([z.number(), z.string()]),
						text: z.string(),
					})),
					type: z.enum(['SingleDialog', 'MultiDialog']),
				})),
			})),
		})),
	}),
});

const questSchema = z.object({
	response: z.literal(200),
	data: z.object({
		items: z.record(z.object({
			chapterCount: z.number(),
			chapterNum: z.string().nullable(),
			chapterTitle: z.string(),
			id: z.number(),
			type: z.string().nullable(),
		})),
	}),
});

const questDetailsSchema = z.object({
	response: z.literal(200),
	data: z.object({
		storyList: z.record(z.object({
			id: z.number(),
			info: z.object({
				title: z.union([z.string(), z.number()]),
				description: z.string(),
			}),
			story: z.record(z.object({
				id: z.number(),
				taskData: z.array(z.object({
					items: z.record(z.object({
						role: z.string(),
						text: z.array(z.object({
							next: z.union([z.number(), z.string()]),
							text: z.string(),
						})),
						type: z.enum(['SingleDialog', 'MultiDialog']),
					})),
				})).nullable(),
			})),
		})),
	}),
});

interface Dialog {
	quote: string,
	reference: string,
	id: string,
}

const normalizeDialog = (text: string) => (
	text
		.replaceAll(/<.+?>/g, '')
		.replaceAll(/\\n/g, '\n')
		.replaceAll(/{NICKNAME}/g, '旅人')
		.replaceAll(/{.+?}/g, '')
		.trim()
);

(async () => {
	await storage.init({
		dir: path.resolve(__dirname, '.cache'),
	});

	const dialogData: Dialog[] = [];

	console.log('Fetching avatars...');
	const avatarsData = avatarSchema.parse(await fetchAmbr('/avatar'));
	const avatars = Object.values(avatarsData.data.items);

	for (const avatar of avatars) {
		// console.log(`Fetching data for ${avatar.name}...`);
		const avatarId = typeof avatar.id === 'number' ? avatar.id.toString() : avatar.id.split('-')[0];
		const avatarFetterData = avatarFetterSchema.parse(await fetchAmbr(`/avatarFetter/${avatarId}`));

		for (const [quoteId, quote] of Object.entries(avatarFetterData.data.quotes)) {
			dialogData.push({
				quote: normalizeDialog(quote.text),
				reference: `${avatar.name}のボイス「${quote.title}」`,
				id: `ambr:quote:${avatar.id}-${quoteId}`,
			});
		}

		// console.log(`Fetching details for ${avatar.name}...`);
		const avatarDetailsData = avatarDetailsSchema.parse(await fetchAmbr(`/avatar/${avatarId}`));
		const furnitureId = avatarDetailsData.data.other?.furnitureId;

		// eslint-disable-next-line no-negated-condition
		if (!furnitureId) {
			// console.log(`No furniture data found for ${avatar.name}.`);
		} else {
			// console.log(`Fetching furniture data for ${avatar.name}...`);
			const furnitureData = furnitureSchema.parse(await fetchAmbr(`/furniture/${furnitureId}`));

			for (const task of Object.values(furnitureData.data.story)) {
				for (const dialog of task.taskData) {
					let dialogTitle = '';
					if (dialog.beginCond !== null) {
						const furnitureName = dialog.beginCond[0].furnitureSuitName;
						if (furnitureName) {
							dialogTitle = `家具セット『${furnitureName}』配置時`;
						}
					}

					if (dialogTitle === '') {
						const firstRoleDialog = dialog.items[dialog.initDialog];
						if (firstRoleDialog) {
							dialogTitle = firstRoleDialog.text[0].text.replaceAll(/<.+?>/g, '');
						}
					}

					if (dialogTitle === '') {
						throw new Error(`No title found for dialog ${avatar.name} ${task.id}`);
					}

					for (const [roleDialogId, roleDialog] of Object.entries(dialog.items)) {
						if (roleDialog.role === 'プレイヤー') {
							continue;
						}

						for (const text of roleDialog.text) {
							dialogData.push({
								quote: normalizeDialog(text.text),
								reference: `${avatar.name}・塵歌壺会話「${dialogTitle}」`,
								id: `ambr:furniture:${avatar.id}-${roleDialogId}`,
							});
						}
					}
				}
			}
		}
	}

	console.log('Fetching quests...');
	const questsData = questSchema.parse(await fetchAmbr('/quest'));
	const quests = Object.values(questsData.data.items);

	for (const quest of quests) {
		let chapterTitle = '';

		if (quest.type === 'aq') {
			chapterTitle = `魔神任務 ${quest.chapterNum}「${quest.chapterTitle}」`;
		}

		if (quest.type === 'lq') {
			chapterTitle = `伝説任務 ${quest.chapterNum}「${quest.chapterTitle}」`;
		}

		if (quest.type === 'eq') {
			chapterTitle = `イベント任務 ${quest.chapterNum}「${quest.chapterTitle}」`;
		}

		if (quest.type === 'wq') {
			chapterTitle = `世界任務「${quest.chapterTitle}」`;
		}

		if (chapterTitle === '') {
			// console.log(`Skipping quest ${quest.chapterTitle} of type ${quest.type}.`);
			continue;
		}

		// console.log(`Fetching details for ${quest.chapterTitle}...`);
		const questDetailsData = questDetailsSchema.parse(await fetchAmbr(`/quest/${quest.id}`));

		for (const [storyListId, storyList] of Object.entries(questDetailsData.data.storyList)) {
			const reference = storyList.info.title === ''
				? chapterTitle
				: `${chapterTitle} ストーリー「${storyList.info.title}」`;

			for (const [storyId, story] of Object.entries(storyList.story)) {
				if (!story.taskData) {
					continue;
				}

				for (const [dialogId, dialog] of Object.entries(story.taskData[0].items)) {
					if (dialog.role === 'プレイヤー') {
						continue;
					}

					for (const text of dialog.text) {
						dialogData.push({
							quote: normalizeDialog(text.text),
							reference,
							id: `ambr:quest:${quest.id}-${storyListId}-${storyId}-${dialogId}`,
						});
					}
				}
			}
		}
	}

	console.log(`${dialogData.length} dialog entries found.`);
	// console.log(sampleSize(dialogData, 10));

	const searchWord = process.argv[2];

	if (searchWord) {
		const searchWordRegex = new RegExp(searchWord, 'gu');
		let found = false;

		console.log(`=== Search Result of ${chalk.magentaBright(searchWord)} ===`);

		const foundReferences = new Set<string>();

		for (const dialog of dialogData) {
			if (dialog.quote.match(searchWordRegex)) {
				if (!foundReferences.has(dialog.reference)) {
					console.log(`\n${chalk.greenBright(dialog.reference)}`);
					foundReferences.add(dialog.reference);
				}

				const hilightedText = dialog.quote.replaceAll(searchWordRegex, (match) => chalk.redBright(match));
				console.log(`${chalk.yellowBright(dialog.id)}: ${hilightedText}`);

				found = true;
			}
		}

		if (!found) {
			console.log('Search word not found.');
		}
	} else {
		const entries: Entry[] = [];

		for await (const file of klaw('data/terms')) {
			if (!file.path.endsWith('.yml')) {
				continue;
			}

			const contents = await fs.readFile(file.path, 'utf8');
			const terms = yaml.load(contents);

			const parsedTerms = termsSchema.parse(terms);
			entries.push(...getEntries(parsedTerms, []));
		}

		console.log(`${entries.length} dictionary entries found.`);
		console.log(sampleSize(entries, 10));

		const unknownWords = new Map<string, Entry>();

		for (const entry of entries) {
			if (entry.isOfficial) {
				continue;
			}

			if (entry.kanji.match(/^[ぁ-んァ-ンヴ・ー]+$/)) {
				continue;
			}

			if (entry.comment.includes('名刺の飾り紋')) {
				continue;
			}

			unknownWords.set(entry.kanji.replaceAll(/[()「」・…⋯]/g, ''), entry);
		}

		console.log(`${unknownWords.size} unknown words found.`);
		console.log(sampleSize([...unknownWords], 10));

		const unknownWordsRegex = new RegExp(
			`(${[...unknownWords.keys()].map(RegexEscape).join('|')})`,
			'gu',
		);

		for (const dialog of dialogData) {
			const matches = dialog.quote.match(unknownWordsRegex);
			if (matches) {
				const entry = unknownWords.get(matches[0]);
				console.log(`Unknown word ${matches[0]} found in ${dialog.reference}: ${entry.comment}`);
			}
		}
	}
})();
