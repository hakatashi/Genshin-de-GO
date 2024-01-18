import {Container, Text, useTick} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useState} from 'react';

export const QuizScene = () => {
	const [scale, setScale] = useState(0.5);

	useTick((delta) => {
		setScale(scale + delta / 300);
	});

	return (
		<Container>
			<Text
				text="望舒旅館"
				x={480}
				y={200}
				scale={scale}
				anchor={0.5}
				style={new TextStyle({
					fontFamily: 'Noto Sans JP',
					fontSize: 144,
					fontStyle: 'normal',
					fontWeight: '800',
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
		</Container>
	);
};


