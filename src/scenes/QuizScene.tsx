import {Container, Text, useTick} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useEffect, useState} from 'react';
import {useRecoilState} from 'recoil';
import {inputTextState, isInputShownState, textInputTimeState} from '../atoms';
import {Button} from '../components/Button';
import {ExplanationDialog} from '../components/ExplanationDialog';
import {Explosion} from '../components/Explosion';
import {QuizConfig} from '../lib/types';

interface QuizProps {
	quiz: QuizConfig,
	onEnd: (state: 'correct' | 'wrong') => void,
}

const Quiz = (props: QuizProps) => {
	const {quiz, onEnd} = props;
	const {kanji, answer, category} = quiz;

	const [scale, setScale] = useState(0.5);
	const [lastAnswer, setLastAnswer] = useState<string | null>(null);
	const [remainingTime, setRemainingTime] = useState<number>(3);
	const [state, setState] = useState<'playing' | 'correct' | 'wrongEffect' | 'wrong'>('playing');
	const [correctTimer, setCorrectTimer] = useState<number | null>(null);
	const [wrongEffectTimer, setWrongEffectTimer] = useState<number | null>(null);

	const [, setIsInputShown] = useRecoilState(isInputShownState);
	const [textInputTime, setTextInputTime] = useRecoilState(textInputTimeState);
	const [inputText, setInputText] = useRecoilState(inputTextState);

	useTick((delta) => {
		if (remainingTime > 0 && state === 'playing') {
			setScale(scale + delta / 1000);
			setRemainingTime(remainingTime - delta / 60);
		}

		if (correctTimer !== null) {
			setCorrectTimer(correctTimer - delta);
			if (correctTimer <= 0) {
				onEnd('correct');
			}
		}

		if (wrongEffectTimer !== null) {
			setWrongEffectTimer(wrongEffectTimer - delta);
			if (wrongEffectTimer <= 0) {
				setState('wrong');
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
				setTextInputTime(null);
				setIsInputShown(false);
				setState('correct');
				setCorrectTimer(5 * 60);
			} else {
				setLastAnswer(inputText);
			}
		}
	}, [textInputTime]);

	useEffect(() => {
		if (remainingTime <= 0) {
			setState('wrongEffect');
			setWrongEffectTimer(2 * 60);
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
			{(state === 'playing' && lastAnswer !== null) && (
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
			)}
			{state === 'correct' && (
				<Container>
					<Explosion x={480} y={200}/>
					<ExplanationDialog x={0} y={440} quiz={quiz}/>
				</Container>
			)}
			{state === 'wrong' && (
				<Container>
					<ExplanationDialog x={0} y={200} quiz={quiz}/>
					<Button
						width={300}
						height={70}
						cx={480}
						cy={400}
						borderRadius={35}
						onClick={() => onEnd('wrong')}
						backgroundColor={0x484848}
						borderColor={0x161616}
						borderWidth={3}
						text="コンティニュー"
						textStyle={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 30,
							fontStyle: 'normal',
							fontWeight: 'bold',
							fill: '#FFFFFF',
						})}
					/>
				</Container>
			)}
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

	const onEnd = (state: 'correct' | 'wrong') => {
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
				key={`${progress}-${remainingLife}`}
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
