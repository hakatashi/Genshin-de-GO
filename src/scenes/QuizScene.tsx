import {Container, Text, useTick} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {inputTextState, isInputShownState, textInputTimeState} from '../atoms';
import {Explosion} from '../components/Explosion';
import {Rectangle} from '../components/Rectangle';

interface QuizConfig {
	kanji: string,
	answer: string,
	category: string[],
	comment: string,
	isOfficial?: boolean,
}

interface QuizProps {
	quiz: QuizConfig,
	onEnd: (state: 'correct' | 'failed') => void,
}

const Quiz = (props: QuizProps) => {
	const {quiz: {kanji, answer, category, comment, isOfficial = false}, onEnd} = props;

	const commentLines = comment.split('\n');

	const [scale, setScale] = useState(0.5);
	const [lastAnswer, setLastAnswer] = useState<string | null>(null);
	const [remainingTime, setRemainingTime] = useState<number>(20);
	const [state, setState] = useState<'playing' | 'correct' | 'failed'>('playing');
	const [endTimer, setEndTimer] = useState<number | null>(null);

	const [, setIsInputShown] = useRecoilState(isInputShownState);
	const textInputTime = useRecoilValue(textInputTimeState);
	const [inputText, setInputText] = useRecoilState(inputTextState);

	useTick((delta) => {
		if (remainingTime > 0 && state === 'playing') {
			setScale(scale + delta / 1000);
			setRemainingTime(remainingTime - delta / 60);
		}

		if (endTimer !== null) {
			setEndTimer(endTimer - delta);
			if (endTimer <= 0 && (state === 'correct' || state === 'failed')) {
				onEnd(state);
			}
		}
	});

	useEffect(() => {
		setIsInputShown(true);
	}, []);

	useEffect(() => {
		if (textInputTime !== null) {
			if (inputText === answer) {
				setLastAnswer(null);
				setInputText('');
				setIsInputShown(false);
				setState('correct');
				setEndTimer(300);
			} else {
				setLastAnswer(inputText);
			}
		}
	}, [textInputTime]);

	useEffect(() => {
		if (remainingTime <= 0) {
			setState('failed');
			setIsInputShown(false);
		}
	}, [remainingTime]);

	return (
		<Container>
			{state === 'playing' ? (
				<>
					<Text
						text={kanji}
						x={480}
						y={200}
						scale={scale}
						anchor={0.5}
						style={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 144,
							fontStyle: 'normal',
							fontWeight: '800',
							fill: ['#f3c72e'],
							stroke: '#000000',
							strokeThickness: 20,
							dropShadow: true,
							dropShadowColor: '#000000',
							dropShadowBlur: 4,
							dropShadowAngle: Math.PI / 6,
							dropShadowDistance: 6,
							wordWrap: true,
							wordWrapWidth: 440,
							lineJoin: 'round',
						})}
					/>
					<Text
						text={`${remainingTime.toFixed(2)}秒`}
						x={480}
						y={40}
						anchor={0.5}
						style={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 48,
							fontStyle: 'normal',
							fontWeight: 'bold',
							fill: '#000',
						})}
					/>
					<Text
						text={category.join(' / ')}
						x={480}
						y={400}
						anchor={0.5}
						style={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 24,
							fontStyle: 'normal',
							fontWeight: 'bold',
							fill: '#000',
						})}
					/>
				</>
			) : null}
			{(state === 'playing' && lastAnswer !== null) ? (
				<Text
					text={`直前の誤答: ${lastAnswer}`}
					x={480}
					y={460}
					anchor={0.5}
					style={new TextStyle({
						fontFamily: 'Noto Sans JP',
						fontSize: 24,
						fontStyle: 'normal',
						fontWeight: 'bold',
						fill: '#000',
					})}
				/>
			) : null}
			{state === 'correct' ? (
				<Container>
					<Explosion x={480} y={200}/>
					<Container x={0} y={440}>
						<Rectangle
							width={960}
							height={100}
							x={0}
							y={0}
							alpha={0.5}
							backgroundColor={0x000000}
						/>
						<Text
							text={kanji}
							x={150}
							y={60}
							anchor={0.5}
							style={new TextStyle({
								fontFamily: 'Noto Sans JP',
								fontSize: 48,
								fontStyle: 'normal',
								fontWeight: 'bold',
								fill: '#f3c72e',
								stroke: '#000000',
								strokeThickness: 5,
								lineJoin: 'round',
							})}
						/>
						<Text
							text={answer}
							x={150}
							y={20}
							anchor={0.5}
							style={new TextStyle({
								fontFamily: 'Noto Sans JP',
								fontSize: 16,
								fontStyle: 'normal',
								fontWeight: 'bold',
								fill: '#f3c72e',
								stroke: '#000000',
								strokeThickness: 5,
								lineJoin: 'round',
							})}
						/>
						<Container x={300} y={5}>
							<Rectangle
								width={40}
								height={16}
								x={0}
								y={0}
								backgroundColor={isOfficial ? 0xF44336 : 0x2196F3}
								borderRadius={3}
							/>
							<Text
								text={isOfficial ? '公式' : '推定'}
								x={20}
								y={8}
								anchor={0.5}
								style={new TextStyle({
									fontFamily: 'Noto Sans JP',
									fontSize: 12,
									fontStyle: 'normal',
									fontWeight: 'bold',
									fill: '#ffffff',
								})}
							/>
						</Container>
						<Text
							text={`ジャンル: ${category.join(' / ')}`}
							x={345}
							y={12}
							anchor={[0, 0.5]}
							style={new TextStyle({
								fontFamily: 'Noto Sans JP',
								fontSize: 14,
								fontStyle: 'normal',
								fontWeight: 'bold',
								fill: '#ffffff',
							})}
						/>
						{commentLines.map((line, index) => (
							<Text
								key={index}
								text={line}
								x={300}
								y={35 + index * 25}
								anchor={[0, 0.5]}
								style={new TextStyle({
									fontFamily: 'Noto Sans JP',
									fontSize: 20,
									fontStyle: 'normal',
									fontWeight: 'bold',
									fill: '#ffffff',
								})}
							/>
						))}
					</Container>
				</Container>
			) : null}
		</Container>
	);
};

interface QuizSceneProps {
	totalProgress: number,
}

const quizzes: QuizConfig[] = [
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月・荻花洲に位置する旅館。',
			'見晴らしがよく、遠方にある軽策山や絶雲の間を眺められる。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月・瓊璣野の廃村。',
			'枯渇した鉱脈が原因で人々が去り、現在は廃墟と化している。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '翠楓庭',
		answer: 'すいふうてい',
		category: ['璃月', '地名'],
		comment: [
			'璃月・漉華の池の近くにある宿屋。',
			'朱店主が経営している。',
			'モナがモンドを訪れる前によく利用していた。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月・荻花洲に位置する旅館。',
			'見晴らしがよく、遠方にある軽策山や絶雲の間を眺められる。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月・瓊璣野の廃村。',
			'枯渇した鉱脈が原因で人々が去り、現在は廃墟と化している。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '翠楓庭',
		answer: 'すいふうてい',
		category: ['璃月', '地名'],
		comment: [
			'璃月・漉華の池の近くにある宿屋。',
			'朱店主が経営している。',
			'モナがモンドを訪れる前によく利用していた。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月・荻花洲に位置する旅館。',
			'見晴らしがよく、遠方にある軽策山や絶雲の間を眺められる。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月・瓊璣野の廃村。',
			'枯渇した鉱脈が原因で人々が去り、現在は廃墟と化している。',
		].join('\n'),
		isOfficial: true,
	},
	{
		kanji: '翠楓庭',
		answer: 'すいふうてい',
		category: ['璃月', '地名'],
		comment: [
			'璃月・漉華の池の近くにある宿屋。',
			'朱店主が経営している。',
			'モナがモンドを訪れる前によく利用していた。',
		].join('\n'),
	},
	{
		kanji: '翠楓庭',
		answer: 'すいふうてい',
		category: ['璃月', '地名'],
		comment: [
			'璃月・漉華の池の近くにある宿屋。',
			'朱店主が経営している。',
			'モナがモンドを訪れる前によく利用していた。',
		].join('\n'),
	},
];

export const QuizScene = (props: QuizSceneProps) => {
	const {totalProgress} = props;

	const [progress, setProgress] = useState(0);
	const [remainingLife, setRemainingLife] = useState(3);

	const onEnd = (state: 'correct' | 'failed') => {
		if (state === 'correct') {
			if (progress + 1 >= totalProgress) {
				setProgress(0);
			} else {
				setProgress(progress + 1);
			}
		} else {
			if (remainingLife - 1 <= 0) {
				setProgress(0);
				setRemainingLife(3);
			} else {
				setRemainingLife(remainingLife - 1);
			}
		}
	};

	return (
		<Container>
			<Quiz
				key={progress}
				quiz={quizzes[progress]}
				onEnd={onEnd}
			/>
			<Text
				text={`${progress + 1} / ${totalProgress}`}
				x={20}
				y={40}
				anchor={[0, 0.5]}
				style={new TextStyle({
					fontFamily: 'Noto Sans JP',
					fontSize: 24,
					fontStyle: 'normal',
					fontWeight: 'bold',
					fill: '#000',
				})}
			/>
			<Text
				text={`残機: ${remainingLife}`}
				x={20}
				y={80}
				anchor={[0, 0.5]}
				style={new TextStyle({
					fontFamily: 'Noto Sans JP',
					fontSize: 24,
					fontStyle: 'normal',
					fontWeight: 'bold',
					fill: '#000',
				})}
			/>
		</Container>
	);
};
