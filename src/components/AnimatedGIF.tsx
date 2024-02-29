/* eslint-disable private-props/no-use-outside */
/* eslint-disable no-underscore-dangle */
import {Container} from '@pixi/display';
import {AnimatedGIF, AnimatedGIFAsset, AnimatedGIFOptions} from '@pixi/gif';
import {PixiComponent, _ReactPixi, applyDefaultProps} from '@pixi/react';
import {Assets, extensions} from 'pixi.js';

extensions.add(AnimatedGIFAsset);

type Instance = Container & {_animatedGif?: AnimatedGIF};

interface AnimatedGIFProps extends _ReactPixi.ISprite {
	playing?: boolean,
	options?: Partial<AnimatedGIFOptions>,
	initialFrame?: number,
}

type AnimatedGIFComponent = _ReactPixi.ICustomComponent<Partial<AnimatedGIFProps>, Instance> & {
	_container?: Instance,
};

const animatedGIFComponent: AnimatedGIFComponent = {
	create(props) {
		this._container = new Container();

		Assets.load<AnimatedGIF>({
			src: '/tree.gif',
			data: {
				autoPlay: props.playing ?? false,
				...props.options,
			},
		}).then((asset) => {
			const animatedGif = asset.clone();

			const initialFrame = props.initialFrame ?? 0;
			animatedGif.currentFrame = initialFrame % animatedGif.totalFrames;

			if (this._container) {
				this._container._animatedGif = animatedGif;
				this._container.addChild(animatedGif);
			}
		});

		return this._container;
	},
	applyProps(instance, oldProps, newProps) {
		applyDefaultProps(instance, oldProps, newProps);

		if (instance._animatedGif) {
			if (newProps.options) {
				instance._animatedGif.loop = newProps.options.loop ?? true;
				instance._animatedGif.animationSpeed = newProps.options.animationSpeed ?? 1;
			}

			if (oldProps.playing !== newProps.playing) {
				if (newProps.playing) {
					instance._animatedGif.play();
				} else {
					instance._animatedGif.stop();
				}
			}

			const oldInitialFrame = oldProps.initialFrame ?? 0;
			const newInitialFrame = newProps.initialFrame ?? 0;
			if (oldInitialFrame !== newInitialFrame) {
				const newCurrentFrame = instance._animatedGif.currentFrame + (newInitialFrame - oldInitialFrame);
				instance._animatedGif.currentFrame = newCurrentFrame % instance._animatedGif.totalFrames;
			}
		}
	},
	willUnmount(instance) {
		if (instance._animatedGif) {
			instance._animatedGif.destroy();
		}
	},
};

const AnimatedGIFPixiComponent = PixiComponent('AnimatedGIF', animatedGIFComponent);

export {AnimatedGIFPixiComponent as AnimatedGIF};
