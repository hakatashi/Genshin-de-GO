import {Container, Sprite, Text, useTick} from '@pixi/react';
import {range} from 'lodash';
import {ease} from 'pixi-ease';
import {Sprite as PixiSprite, Text as PixiText, TextStyle} from 'pixi.js';
import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useRecoilState} from 'recoil';
import dictionary from '../../data/dictionary';
import {inputTextState, isInputShownState, sceneState, textInputTimeState} from '../atoms';
import {Button} from '../components/Button';
import {ExplanationDialog} from '../components/ExplanationDialog';
import {Explosion} from '../components/Explosion';
import GameBackground from '../components/GameBackground';
import {Kanji} from '../components/Kanji';
import {Polygon} from '../components/Polygon';
import {Rectangle} from '../components/Rectangle';
import {QuizConfig} from '../lib/types';

interface QuizProps {
	quiz: QuizConfig,
	onEnd: (state: 'correct' | 'wrong') => void,
}

const Quiz = (props: QuizProps) => {
	const {quiz, onEnd} = props;
	const {answers, category} = quiz;

	const [ticks, setTicks] = useState(0);
	const [lastAnswer, setLastAnswer] = useState<string | null>(null);
	// eslint-disable-next-line react/hook-use-state
	const [startTime] = useState<number>(Date.now());
	const [state, setState] = useState<'playing' | 'correct'>('playing');
	const [correctTimer, setCorrectTimer] = useState<number | null>(null);
	const [isCountdownStarted, setIsCountdownStarted] = useState(false);
	const [remainingTimeText, setRemainingTimeText] = useState<string | null>(null);

	const [, setIsInputShown] = useRecoilState(isInputShownState);
	const [textInputTime, setTextInputTime] = useRecoilState(textInputTimeState);
	const [inputText, setInputText] = useRecoilState(inputTextState);

	const countdownRef = useRef<PixiSprite | null>(null);
	const remainingTimeTextRef = useRef<PixiText | null>(null);

	const consumedTime = (Date.now() - startTime) / 1000;
	const remainingTime = 20 - consumedTime;
	const scale = 0.5 + consumedTime / 20;

	useTick((delta) => {
		setTicks(ticks + 1);

		if (correctTimer !== null) {
			setCorrectTimer(correctTimer - delta);
			if (correctTimer <= 0) {
				onEnd('correct');
			}
		}
	});

	useEffect(() => {
		setIsInputShown(true);
	}, []);

	useEffect(() => {
		if (textInputTime !== null) {
			if (answers.includes(inputText)) {
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
		if (remainingTime <= 0 && state === 'playing') {
			setLastAnswer(null);
			setInputText('');
			setTextInputTime(null);
			setIsInputShown(false);
			onEnd('wrong');
		}

		if (remainingTime <= 5) {
			setRemainingTimeText(Math.ceil(remainingTime).toString());
		}
	}, [remainingTime]);

	const kanjiLength = quiz.kanji.length + quiz.prefix.length + quiz.suffix.length;
	const kanjiFontSize = kanjiLength <= 5 ? 144 : 144 * 5 / kanjiLength;

	const kanjiTextStyle = useMemo(() => new TextStyle({
		fontFamily: 'Noto Sans JP',
		fontSize: kanjiFontSize,
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
	}), [kanjiFontSize]);

	useEffect(() => {
		if (countdownRef.current !== null && !isCountdownStarted && remainingTime <= 6.5) {
			ease.add(
				countdownRef.current,
				{y: 50},
				{
					duration: 1200,
					ease: 'easeOutExpo',
				},
			);

			setIsCountdownStarted(true);
		}
	}, [countdownRef.current, remainingTime, isCountdownStarted]);

	useEffect(() => {
		if (remainingTimeTextRef.current !== null) {
			ease.add(
				remainingTimeTextRef.current,
				{
					alpha: 0,
					scale: 1.3,
				},
				{
					duration: 300,
					ease: 'linear',
				},
			);
		}
	}, [remainingTimeTextRef.current, remainingTimeText]);

	return (
		<Container>
			{state === 'playing' ? (
				<>
					<Container
						x={480}
						y={350 - (scale < 0.505 ? (scale - 0.5) * 100000 : 0)}
						scale={scale}
						pivot={0}
					>
						<Kanji
							x={0}
							y={0}
							quiz={quiz}
							style={kanjiTextStyle}
							maxWidth={1000}
						/>
					</Container>
					<Sprite
						image="/countdown.png"
						x={480}
						y={-100}
						anchor={0.5}
						ref={countdownRef}
					/>
					{remainingTimeText !== null && (
						<>
							<Text
								text={remainingTimeText}
								x={480}
								y={40}
								anchor={0.5}
								style={new TextStyle({
									fontFamily: 'Silkscreen',
									fontSize: 90,
									fill: '#FFF',
								})}
							/>
							<Text
								text={remainingTimeText}
								key={remainingTimeText}
								ref={remainingTimeTextRef}
								x={480}
								y={40}
								anchor={0.5}
								style={new TextStyle({
									fontFamily: 'Silkscreen',
									fontSize: 90,
									fill: '#FFF',
								})}
							/>
						</>
					)}
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
					<Explosion x={480} y={300}/>
					<ExplanationDialog x={0} y={440} quiz={quiz}/>
				</Container>
			)}
		</Container>
	);
};

const getProgressColor = (progress: number) => {
	const categories = [
		[0x2196F3, 3],
		[0x4CAF50, 3],
		[0xFF9800, 3],
		[0xF44336, 1],
	];

	let total = 0;
	for (const [color, count] of categories) {
		if (progress < total + count) {
			return color;
		}

		total += count;
	}

	return 0x000000;
};

interface ProgressBarProps {
	progress: number,
	totalProgress: number,
	x: number,
	y: number,
}

const ProgressBar = (props: ProgressBarProps) => {
	const {x, y, progress, totalProgress} = props;

	const sheer = 7;
	const width = 30;
	const height = 20;
	const gap = 5;
	const padding = 6;
	const marginLeft = 5;

	return (
		<Container
			x={x}
			y={y}
		>
			<Polygon
				points={[
					[0, padding],
					[marginLeft + (width + gap) * (totalProgress - 1) + width + sheer, padding],
					[marginLeft + (width + gap) * (totalProgress - 1) + width, padding + height],
					[0, padding + height],
				]}
				backgroundColor={0x444444}
				borderWidth={padding * 2}
				borderColor={0x444444}
				x={0}
				y={0}
			/>
			{range(totalProgress).map((i) => (
				<Polygon
					key={i}
					points={[
						[0, height],
						[width, height],
						[width + sheer, 0],
						[sheer, 0],
					]}
					backgroundColor={i < progress ? getProgressColor(i) : 0x888888}
					x={marginLeft + (width + gap) * i}
					y={padding}
				/>
			))}
			{range(totalProgress).map((i) => (
				<Text
					key={i}
					text={(i + 1).toString()}
					x={marginLeft + (width + gap) * i + width * 0.6}
					y={padding + height / 2}
					anchor={0.5}
					style={new TextStyle({
						fontFamily: 'Noto Sans JP',
						fontSize: 18,
						fontStyle: 'normal',
						fontWeight: 'bold',
						align: 'center',
						fill: 'white',
					})}
				/>
			))}
		</Container>
	);
};

const getRandomQuiz = (level: number) => {
	const candidates = dictionary.filter((quiz) => quiz.level === level);
	return candidates[Math.floor(Math.random() * candidates.length)];
};

const getQuizForProgress = (progress: number) => {
	if (progress < 3) {
		return getRandomQuiz(1);
	}
	if (progress < 6) {
		return getRandomQuiz(2);
	}
	if (progress < 9) {
		return getRandomQuiz(3);
	}
	return getRandomQuiz(4);
};

interface QuizSceneProps {
	totalProgress: number,
}

export const QuizScene = (props: QuizSceneProps) => {
	const {totalProgress} = props;

	const [phase, setPhase] = useState<'playing' | 'clear' | 'wrongEffect' | 'waitForContinue' | 'gameover'>('playing');
	const [progress, setProgress] = useState(0);
	const [remainingLife, setRemainingLife] = useState(3);
	const [quiz, setQuiz] = useState<QuizConfig | null>(null);
	const [wrongEffectTimer, setWrongEffectTimer] = useState<number | null>(null);

	const [, setScene] = useRecoilState(sceneState);

	useTick((delta) => {
		if (wrongEffectTimer !== null) {
			setWrongEffectTimer(wrongEffectTimer - delta);
			if (wrongEffectTimer <= 0) {
				setWrongEffectTimer(null);
				if (remainingLife <= 0) {
					setPhase('gameover');
				} else {
					setPhase('waitForContinue');
				}
			}
		}
	});

	useEffect(() => {
		setQuiz(getQuizForProgress(progress));
	}, []);

	const onEnd = useCallback((state: 'correct' | 'wrong') => {
		if (state === 'correct') {
			if (progress + 1 >= totalProgress) {
				setPhase('clear');
			} else {
				setProgress(progress + 1);
				setQuiz(getQuizForProgress(progress + 1));
			}
		} else {
			setRemainingLife(remainingLife - 1);
			setPhase('wrongEffect');
			setWrongEffectTimer(3 * 60);
		}
	}, [progress, remainingLife]);

	const onClickContinue = useCallback(() => {
		setPhase('playing');
		setQuiz(getQuizForProgress(progress));
	}, [progress]);

	return (
		<Container>
			<Sprite
				image="/background05.png"
			/>
			<GameBackground active={phase === 'playing'}/>
			{quiz !== null && phase === 'playing' && (
				<Quiz
					key={`${progress}-${remainingLife}`}
					quiz={quiz}
					onEnd={onEnd}
				/>
			)}
			<ProgressBar
				x={0}
				y={10}
				progress={progress}
				totalProgress={totalProgress}
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
			{phase === 'waitForContinue' && (
				<Container>
					<ExplanationDialog x={0} y={200} quiz={quiz!}/>
					<Button
						width={300}
						height={70}
						cx={480}
						cy={400}
						borderRadius={35}
						onClick={onClickContinue}
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
			{phase === 'gameover' && (
				<Container>
					<Text
						text="ゲームオーバー"
						x={480}
						y={200}
						anchor={[0.5, 0.5]}
						style={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 48,
							fontStyle: 'normal',
							fontWeight: 'bold',
							fill: '#000',
						})}
					/>
					<ExplanationDialog x={0} y={250} quiz={quiz!}/>
					<Button
						width={300}
						height={70}
						cx={480}
						cy={450}
						borderRadius={35}
						onClick={() => setScene('home')}
						backgroundColor={0x484848}
						borderColor={0x161616}
						borderWidth={3}
						text="タイトルへ"
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
			{phase === 'clear' && (
				<Container>
					<Text
						text="クリア!"
						x={480}
						y={200}
						anchor={[0.5, 0.5]}
						style={new TextStyle({
							fontFamily: 'Noto Sans JP',
							fontSize: 48,
							fontStyle: 'normal',
							fontWeight: 'bold',
							fill: '#000',
						})}
					/>
					<Button
						width={300}
						height={70}
						cx={480}
						cy={300}
						borderRadius={35}
						onClick={() => setScene('home')}
						backgroundColor={0x484848}
						borderColor={0x161616}
						borderWidth={3}
						text="タイトルへ"
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
