import {Container, Text, useTick} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useCallback, useEffect, useState} from 'react';
import {useRecoilState} from 'recoil';
import dictionary from '../../data/dictionary';
import {inputTextState, isInputShownState, sceneState, textInputTimeState} from '../atoms';
import {Button} from '../components/Button';
import {ExplanationDialog} from '../components/ExplanationDialog';
import {Explosion} from '../components/Explosion';
import {Kanji} from '../components/Kanji';
import {QuizConfig} from '../lib/types';

interface QuizProps {
	quiz: QuizConfig,
	onEnd: (state: 'correct' | 'wrong') => void,
}

const Quiz = (props: QuizProps) => {
	const {quiz, onEnd} = props;
	const {answers, category} = quiz;

	const [scale, setScale] = useState(0.5);
	const [lastAnswer, setLastAnswer] = useState<string | null>(null);
	const [remainingTime, setRemainingTime] = useState<number>(20);
	const [state, setState] = useState<'playing' | 'correct'>('playing');
	const [correctTimer, setCorrectTimer] = useState<number | null>(null);

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
		if (remainingTime <= 0) {
			setLastAnswer(null);
			setInputText('');
			setTextInputTime(null);
			setIsInputShown(false);
			onEnd('wrong');
		}
	}, [remainingTime]);

	return (
		<Container>
			{state === 'playing' ? (
				<>
					<Kanji
						x={480}
						y={200 + 50 * scale}
						scale={scale}
						quiz={quiz}
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
						maxWidth={1000}
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
			{quiz !== null && phase === 'playing' && (
				<Quiz
					key={`${progress}-${remainingLife}`}
					quiz={quiz}
					onEnd={onEnd}
				/>
			)}
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
