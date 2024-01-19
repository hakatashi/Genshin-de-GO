import {Container} from '@pixi/display';
import {EmitterConfigV3, Emitter as ParticleEmitter} from '@pixi/particle-emitter';
import {PixiComponent, _ReactPixi} from '@pixi/react';

interface EmitterProps {
	config: EmitterConfigV3,
}

type EmitterComponent = _ReactPixi.ICustomComponent<EmitterProps, Container> & {
	_emitter?: ParticleEmitter,
	_raf?: number,
};

const emitterComponent: EmitterComponent = {
	create() {
		return new Container();
	},
	applyProps(instance, oldProps, newProps) {
		const {config} = newProps;

		if (!this._emitter) {
			this._emitter = new ParticleEmitter(
				instance,
				config,
			);

			let elapsed = Date.now();

			const t = () => {
				if (!this._emitter) {
					return;
				}

				this._raf = requestAnimationFrame(t);
				const now = Date.now();

				this._emitter.update((now - elapsed) * 0.001);

				elapsed = now;
			};

			this._emitter.emit = true;
			t();
		}
	},
	willUnmount() {
		if (this._emitter) {
			this._emitter.emit = false;
		}
		if (this._raf) {
			cancelAnimationFrame(this._raf);
		}
	},
};

export const Emitter = PixiComponent('Emitter', emitterComponent);

