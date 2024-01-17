import {Sprite, _ReactPixi, useTick} from '@pixi/react';
import {useRef, useReducer} from 'react';

type SpriteProps = Partial<_ReactPixi.ISprite>;

const reducer = (state: SpriteProps, action: {type: string, data: SpriteProps}) => {
	if (action.type === 'update') {
		return action.data;
	}
	return state;
};

export const Bunny = () => {
	const [motion, update] = useReducer(reducer, {});
	const iter = useRef(0);

	useTick((delta) => {
		iter.current += 0.05 * delta;
		const i = iter.current;

		update({
			type: 'update',
			data: {
				x: Math.sin(i) * 300 + 500,
				y: Math.sin(i / 1.5) * 300 + 500,
				rotation: Math.sin(i) * Math.PI,
				anchor: Math.sin(i / 2),
			},
		});
	});

	return <Sprite image="/logo192.png" {...motion}/>;
};
