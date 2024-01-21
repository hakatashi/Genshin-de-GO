import {Container, Text} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {QuizConfig} from '../lib/types';
import {Rectangle} from './Rectangle';

interface ExplanationDialogProps {
	quiz: QuizConfig,
	x: number,
	y: number,
}

export const ExplanationDialog = (props: ExplanationDialogProps) => {
	const {quiz: {kanji, answers, category, comment, isOfficial = false}, x, y} = props;

	const commentLines = comment.split('\n');

	return (
		<Container x={x} y={y}>
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
				text={answers[0]}
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
				y={13}
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
	);
};
