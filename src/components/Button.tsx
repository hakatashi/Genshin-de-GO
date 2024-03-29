import type {Graphics as PixiGraphics} from '@pixi/graphics';
import {Container, Graphics, Text} from '@pixi/react';
import {TextStyle} from 'pixi.js';
import {useCallback} from 'react';

interface ButtonProps {
	width: number,
	height: number,
	cx: number,
	cy: number,
	borderRadius: number,
	onClick: () => void,
	backgroundColor: number,
	borderColor: number,
	borderWidth: number,
	text: string,
	textStyle: TextStyle,
}

export const Button = (props: ButtonProps) => {
	const draw = useCallback((g: PixiGraphics) => {
		g.clear();
		g.lineStyle(props.borderWidth, props.borderColor);
		g.beginFill(props.backgroundColor);
		g.drawRoundedRect(
			-props.width / 2,
			-props.height / 2,
			props.width,
			props.height,
			props.borderRadius,
		);
		g.endFill();
	}, [props.width, props.height, props.borderRadius, props.backgroundColor, props.borderColor, props.borderWidth]);

	return (
		<Container
			x={props.cx}
			y={props.cy}
			onclick={props.onClick}
			ontap={props.onClick}
			eventMode="static"
			cursor="pointer"
		>
			<Graphics
				draw={draw}
				x={0}
				y={0}
				anchor={0.5}
			/>
			<Text
				text={props.text}
				x={0}
				y={0}
				anchor={0.5}
				style={props.textStyle}
			/>
		</Container>
	);
};

