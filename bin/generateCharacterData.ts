import assert from 'assert';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import {hiraganize} from 'japanese';
import {tokenize} from 'kuromojin';
import {partition} from 'lodash';
import storage from 'node-persist';
import {z} from 'zod';

const characterSchema = z.object({
	entry_page_id: z.string(),
	name: z.string(),
});

type Character = z.infer<typeof characterSchema>;

const pageListSchema = z.object({
	data: z.object({
		list: z.array(characterSchema),
	}),
});

const wikiDataSchema = z.object({
	data: z.object({
		page: z.object({
			id: z.string(),
			name: z.string(),
			modules: z.array(z.object({
				components: z.array(z.object({
					component_id: z.string(),
					data: z.string(),
				})),
				id: z.string(),
				name: z.string(),
			})),
		}),
	}),
});

const statusModuleSchema = z.object({
	list: z.array(z.object({
		key: z.string(),
		value: z.array(z.string()),
	})),
});

const galleryModuleSchema = z.object({
	list: z.array(z.object({
		key: z.string(),
		imgDesc: z.string(),
	})),
});

const talentsModuleSchema = z.object({
	list: z.array(z.object({
		attributes: z.union([
			z.null(),
			z.array(z.object({
				key: z.string(),
				values: z.array(z.string()),
			})),
		]),
		title: z.string(),
		desc: z.string(),
	})),
});

const constellationsModuleSchema = z.object({
	list: z.array(z.object({
		name: z.string(),
		desc: z.string(),
	})),
});

const toAbsolute = (p: string) => path.resolve(__dirname, p);

const getReading = async (text: string) => {
	const tokens = await tokenize(text);
	const reading = hiraganize(tokens.map((t) => {
		if (t.surface_form.match(/^[ァ-ンー]+$/)) {
			return hiraganize(t.surface_form);
		}
		return t.reading ?? hiraganize(t.surface_form);
	}).join(''));
	return reading.replaceAll(/[「」（）、。！？!?―・\s]/g, '');
};

const getTermTemplate = async (name: string, comment: sting) => [
	`    - kanji: ${name.replaceAll('\n', ' ')}`,
	`      yomi: ${await getReading(name.replaceAll('\n', ''))}`,
	'      comment: |',
	`        ${comment}`,
].join('\n');

(async () => {
	await storage.init({dir: toAbsolute('.cache')});

	const getPageList = async (menuId: string, lang: string, page: number) => {
		const cacheId = `hoyowiki-page-list-${menuId}-${lang}-${page}`;
		const cached = await storage.getItem(cacheId);

		if (cached) {
			return pageListSchema.parse(cached).data;
		}

		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});

		const res = await axios.post('https://sg-wiki-api.hoyolab.com/hoyowiki/genshin/wapi/get_entry_page_list', {
			filters: [],
			menu_id: menuId,
			page_num: page,
			page_size: 30,
			use_es: true,
		}, {
			headers: {
				'x-rpc-language': lang,
				'x-rpc-wiki_app': 'genshin',
				referer: 'https://genshin.hoyolab.com/',
			},
		});

		if (res.status !== 200 || !res.data?.data) {
			throw new Error(`Failed to fetch data for ${menuId} (lang = ${lang})`);
		}

		const pageList = pageListSchema.parse(res.data);

		console.log(`Fetched ${pageList.data.list.length} characters (page = ${page}, lang = ${lang})`);

		await storage.setItem(cacheId, pageList);

		return pageList.data;
	};

	const getWikiData = async (id: string, lang: string) => {
		const cacheId = `hoyowiki-${id}-${lang}`;
		const cached = await storage.getItem(cacheId);

		if (cached) {
			return wikiDataSchema.parse(cached).data;
		}

		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});

		const res = await axios.get('https://sg-wiki-api-static.hoyolab.com/hoyowiki/genshin/wapi/entry_page', {
			params: {
				entry_page_id: id,
			},
			headers: {
				'x-rpc-language': lang,
				'x-rpc-wiki_app': 'genshin',
			},
		});

		if (res.status !== 200 || !res.data?.data) {
			throw new Error(`Failed to fetch data for ${id} (lang = ${lang})`);
		}

		const wikiData = wikiDataSchema.parse(res.data);

		await storage.setItem(cacheId, wikiData);

		return wikiData.data;
	};

	let page = 1;
	const characters: Character[] = [];

	while (true) {
		const pageList = await getPageList('2', 'ja-jp', page);
		characters.push(...pageList.list);

		if (pageList.list.length < 30) {
			break;
		}

		page++;
	}

	for (const character of characters) {
		try {
			if (character.name.includes('旅人')) {
				continue;
			}

			if (await fs.stat(toAbsolute(`../data/terms/characters/${character.name}.yml`)).catch(() => null)) {
				console.log(`Skipping ${character.name}...`);
				continue;
			}

			console.log(`Fetching ${character.name}...`);
			const data = await getWikiData(character.entry_page_id, 'ja-jp');

			const {modules} = data.page;

			const statusModule = modules.find((m) => m.id === '1');
			const statusData = (statusModule?.components ?? []).find((c) => c.component_id === 'baseInfo')?.data;
			const status = statusModuleSchema.parse(JSON.parse(statusData ?? '{}'));

			const galleryModule = modules.find((m) => m.id === '3');
			const galleryData = (galleryModule?.components ?? []).find((c) => c.component_id === 'gallery_character')?.data;
			const gallery = galleryModuleSchema.parse(JSON.parse(galleryData ?? '{}'));

			const talentsModule = modules.find((m) => m.id === '4');
			const talentsData = (talentsModule?.components ?? []).find((c) => c.component_id === 'talent')?.data;
			const talents = talentsModuleSchema.parse(JSON.parse(talentsData ?? '{}'));

			const constellationsModule = modules.find((m) => m.id === '5');
			const constellationsData = (constellationsModule?.components ?? []).find((c) => c.component_id === 'summaryList')?.data;
			const constellations = constellationsModuleSchema.parse(JSON.parse(constellationsData ?? '{}'));

			const [battleTalents, nonBattleTalents] = partition(talents.list, (t) => {
				if (t.attributes === null) {
					return false;
				}
				const levels = t.attributes[0]?.values?.length;
				return levels && levels >= 10;
			});

			assert(battleTalents.length === 3, `Expected 3 battle talents, got ${battleTalents.length}`);

			const normalTalentTitle = battleTalents[0].title.startsWith('通常攻撃・')
				? battleTalents[0].title.slice(5)
				: battleTalents[0].title;

			let specialTalent: null | typeof nonBattleTalents[0] = null;
			if (nonBattleTalents.length >= 4) {
				specialTalent = nonBattleTalents.shift()!;
			}

			const title = status.list.find((c) => c.key === '称号')?.value?.[0];
			const constellationName = status.list.find((c) => c.key === '命ノ星座')?.value?.[0];

			assert(constellationName !== undefined, `Failed to parse constellation name for ${character.name}`);

			const normalizedConstellationName = constellationName.replace(/<.+?>/g, '');

			const normalCostumeDescription = gallery.list.find((c) => c.key === '原画')?.imgDesc;
			const normalCostumeRegexp = /<p>初期衣装(?:ー| - |——)(?<costume>.+?)<\/p>/;
			const normalConsume = normalCostumeDescription?.match(normalCostumeRegexp)?.groups?.costume;

			assert(normalConsume !== undefined, `Failed to parse normal costume for ${character.name}`);

			const specialCostumeDescription = gallery.list.find((c) => c.key === 'コスチューム')?.imgDesc;
			const specialCostumeRegexp = /<p>(?<costumeType>.+?)(?:ー| - |——)(?<costumeName>.+?)<\/p>/;
			const specialConsume = specialCostumeDescription?.match(specialCostumeRegexp)?.groups?.costumeName;
			const specialConsumeType = specialCostumeDescription?.match(specialCostumeRegexp)?.groups?.costumeType;

			const cardDecorationDescription = gallery.list.find((c) => c.key === '名刺の飾り紋1')?.imgDesc;
			const cardDecorationRegexp = /<p>(?:.+?)・(?<name>.+?)<\/p>/;
			const cardDecoration = cardDecorationDescription?.match(cardDecorationRegexp)?.groups?.name;

			const template = [
				`${character.name}:`,
				'  衣装:',
				await getTermTemplate(normalConsume, `${character.name}の初期衣装。`),
				'',
				...(specialConsume === undefined ? [] : [
					await getTermTemplate(specialConsume, `${character.name}の${specialConsumeType}。`),
					'',
				]),
				...(cardDecoration === undefined ? [] : [
					'  名刺の飾り紋:',
					await getTermTemplate(cardDecoration, `${character.name}の名刺の飾り紋。`),
					'',
				]),
				'  称号:',
				await getTermTemplate(title ?? '', `${character.name}の称号。`),
				'',
				'  通常攻撃:',
				await getTermTemplate(normalTalentTitle, `${character.name}の通常攻撃。`),
				'',
				'  元素スキル:',
				await getTermTemplate(battleTalents[1].title, `${character.name}の元素スキル。`),
				'',
				...(specialTalent === null ? [] : [
					'  特殊天賦:',
					await getTermTemplate(specialTalent.title, `${character.name}の特殊天賦。`),
					'',
				]),
				'  元素爆発:',
				await getTermTemplate(battleTalents[2].title, `${character.name}の元素爆発。`),
				'',
				'  固有天賦:',
				...(await Promise.all(nonBattleTalents.map(async (t) => [
					await getTermTemplate(t.title, `${character.name}の固有天賦。`),
					'',
				]))).flat(),
				'  命ノ星座:',
				await getTermTemplate(normalizedConstellationName, `${character.name}の命ノ星座。`),
				'',
				...(await Promise.all(constellations.list.map(async (c, i) => [
					await getTermTemplate(c.name, `${character.name}の命ノ星座・第${i + 1}重。`),
					'',
				]))).flat(),
			].join('\n');

			await fs.writeFile(toAbsolute(`../data/terms/characters/${character.name}.yml`), template);
		} catch (e) {
			console.error(e);
		}
	}
})();
