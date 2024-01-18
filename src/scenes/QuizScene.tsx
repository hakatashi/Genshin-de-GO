import {Container, Text, useTick} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {inputTextState, isInputShownState, textInputTimeState} from '../atoms';

export const QuizScene = () => {
	const [scale, setScale] = useState(0.5);
	const [lastAnswer, setLastAnswer] = useState<string | null>(null);
	const [remainingTime, setRemainingTime] = useState<number>(20);

	const [, setIsInputShown] = useRecoilState(isInputShownState);
	const textInputTime = useRecoilValue(textInputTimeState);
	const inputText = useRecoilValue(inputTextState);

	const kanji = '望舒旅館';
	const answer = 'ぼうじょりょかん';

	useTick((delta) => {
		if (remainingTime > 0) {
			setScale(scale + delta / 1000);
			setRemainingTime(remainingTime - delta / 60);
		}
	});

	useEffect(() => {
		setIsInputShown(true);
	}, []);

	useEffect(() => {
		if (textInputTime !== null) {
			if (inputText === answer) {
				setLastAnswer('正解');
			}
			setLastAnswer(inputText);
		}
	}, [textInputTime]);

	useEffect(() => {
		if (remainingTime <= 0) {
			setIsInputShown(false);
		}
	}, [remainingTime]);

	return (
		<Container>
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
		</Container>
	);
};


