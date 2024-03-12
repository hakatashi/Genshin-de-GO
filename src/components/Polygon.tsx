import type {Graphics as PixiGraphics} from '@pixi/graphics';
import {Container, Graphics} from '@pixi/react';
import {useCallback} from 'react';

const defaultProps = {
	backgroundColor: 0x000000,
	borderColor: 0x000000,
	borderWidth: 0,
	alpha: 1,
};

type PolygonProps = {
	points: [number, number][],
	x: number,
	y: number,
	backgroundColor?: number,
	borderColor?: number,
	borderWidth?: number,
	alpha?: number,
} & typeof defaultProps;

export const Polygon = (props: PolygonProps) => {
	const {
		points,
		x,
		y,
		backgroundColor,
		borderColor,
		borderWidth,
		alpha,
	} = props;

	const draw = useCallback((g: PixiGraphics) => {
		g.clear();
		if (borderWidth > 0) {
			g.lineStyle(borderWidth, borderColor);
		}
		g.beginFill(backgroundColor, alpha);
		g.drawPolygon(points.flat());
		g.endFill();
	}, [points, borderColor, borderWidth, alpha]);

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

Polygon.defaultProps = defaultProps;
