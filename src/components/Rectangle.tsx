import type {Graphics as PixiGraphics} from '@pixi/graphics';
import {Container, Graphics} from '@pixi/react';
import {useCallback} from 'react';

const defaultProps = {
	borderRadius: 0,
	borderColor: 0x000000,
	borderWidth: 0,
	alpha: 1,
};

type RectangleProps = {
	width: number,
	height: number,
	x: number,
	y: number,
	borderRadius?: number,
	backgroundColor: number,
	borderColor?: number,
	borderWidth?: number,
	alpha?: number,
} & typeof defaultProps;

export const Rectangle = (props: RectangleProps) => {
	const {
		width,
		height,
		x,
		y,
		borderRadius,
		backgroundColor,
		borderColor,
		borderWidth,
		alpha,
	} = props;

	const draw = useCallback((g: PixiGraphics) => {
		g.clear();
		if (borderColor && borderWidth) {
			g.lineStyle(borderWidth, borderColor);
		}
		g.beginFill(backgroundColor, alpha);
		g.drawRoundedRect(
			0,
			0,
			width,
			height,
			borderRadius,
		);
		g.endFill();
	}, [width, height, borderRadius, backgroundColor, borderColor, borderWidth]);

	return (
		<Container
			x={x}
			y={y}
		>
			<Graphics
				draw={draw}
				x={0}
				y={0}
			/>
		</Container>
	);
};

Rectangle.defaultProps = defaultProps;
