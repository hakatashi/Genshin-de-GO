import {Container, Text} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useRecoilState} from 'recoil';
import {sceneState} from '../atoms';
import {Button} from '../components/Button';

export const HomeScene = () => {
	const [, setScene] = useRecoilState(sceneState);

	return (
		<Container>
			<Text
				text="原神でGO!"
				x={480}
				y={200}
				anchor={0.5}
				style={new TextStyle({
					fontFamily: 'sans-serif',
					fontSize: 144,
					fontStyle: 'normal',
					fontWeight: 'bold',
					fill: ['#ffffff', '#f3c72e'],
					stroke: '#932e00',
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
			<Button
				width={400}
				height={100}
				cx={480}
				cy={400}
				borderRadius={10}
				onClick={() => {
					console.log('clicked');
					setScene('quiz');
				}}
				backgroundColor={0xbc9c56}
				borderColor={0x604200}
				borderWidth={0}
				text="はじめる"
				textStyle={new TextStyle({
					fontFamily: 'sans-serif',
					fontSize: 48,
					fontStyle: 'normal',
					fontWeight: 'bold',
					fill: '#604200',
				})}
			/>
		</Container>
	);
};

