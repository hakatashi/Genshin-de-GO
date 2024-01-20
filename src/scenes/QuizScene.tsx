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
}

interface QuizProps {
	quiz: QuizConfig,
	onEnd: (state: 'correct' | 'failed') => void,
}

const Quiz = (props: QuizProps) => {
	const {quiz: {kanji, answer, category, comment}, onEnd} = props;

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
				setLastAnswer('');
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
						y={80}
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
			{lastAnswer === null ? null : (
				<Text
					text={lastAnswer}
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
						{commentLines.map((line, index) => (
							<Text
								key={index}
								text={line}
								x={300}
								y={30 + index * 15}
								anchor={[0, 0.5]}
								style={new TextStyle({
									fontFamily: 'Noto Sans JP',
									fontSize: 24,
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
			'璃月の旅館。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月の町。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月の旅館。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月の町。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月の旅館。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月の町。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月の旅館。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月の町。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '望舒旅館',
		answer: 'ぼうじょりょかん',
		category: ['璃月', '地名'],
		comment: [
			'璃月の旅館。璃月の中心部に位置する。',
		].join('\n'),
	},
	{
		kanji: '明蘊町',
		answer: 'めいうんちょう',
		category: ['璃月', '地名'],
		comment: [
			'璃月の町。璃月の中心部に位置する。',
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
