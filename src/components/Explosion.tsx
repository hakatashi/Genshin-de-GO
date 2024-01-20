/* eslint-disable id-denylist, id-blacklist */
import {Texture} from 'pixi.js';
import {Emitter} from './Particles';

interface ExplosionProps {
  x: number,
  y: number,
}

export const Explosion = ({x, y}: ExplosionProps) => (
	<>
		<Emitter
			config={{
				lifetime: {
					min: 0.5,
					max: 1,
				},
				ease: [
					{
						s: 0,
						cp: 0.329,
						e: 0.548,
					},
					{
						s: 0.548,
						cp: 0.767,
						e: 0.876,
					},
					{
						s: 0.876,
						cp: 0.985,
						e: 1,
					},
				],
				frequency: 0.001,
				emitterLifetime: 0.1,
				maxParticles: 100,
				addAtBack: true,
				pos: {x, y},
				behaviors: [
					{
						type: 'alpha',
						config: {
							alpha: {
								list: [
									{
										time: 0,
										value: 0.74,
									},
									{
										time: 1,
										value: 0,
									},
								],
							},
						},
					},
					{
						type: 'moveSpeed',
						config: {
							speed: {
								list: [
									{
										time: 0,
										value: 700,
									},
									{
										time: 1,
										value: 0,
									},
								],
							},
						},
					},
					{
						type: 'scale',
						config: {
							scale: {
								list: [
									{
										time: 0,
										value: 5,
									},
									{
										time: 1,
										value: 1.2,
									},
								],
							},
							minMult: 1,
						},
					},
					{
						type: 'color',
						config: {
							color: {
								list: [
									{
										time: 0,
										value: 'ffdfa0',
									},
									{
										time: 1,
										value: '100f0c',
									},
								],
							},
						},
					},
					{
						type: 'rotation',
						config: {
							accel: 0,
							minSpeed: 0,
							maxSpeed: 200,
							minStart: 0,
							maxStart: 360,
						},
					},
					{
						type: 'textureRandom',
						config: {
							textures: [
								Texture.from('https://pixijs.io/particle-emitter/examples/images/particle.png'),
							],
						},
					},
					{
						type: 'spawnPoint',
						config: {},
					},
				],
			}}
		/>
		<Emitter
			config={{
				lifetime: {
					min: 0.5,
					max: 1,
				},
				ease: [
					{
						s: 0,
						cp: 0.329,
						e: 0.548,
					},
					{
						s: 0.548,
						cp: 0.767,
						e: 0.876,
					},
					{
						s: 0.876,
						cp: 0.985,
						e: 1,
					},
				],
				frequency: 0.001,
				emitterLifetime: 0.1,
				maxParticles: 100,
				addAtBack: true,
				pos: {x, y},
				behaviors: [
					{
						type: 'alpha',
						config: {
							alpha: {
								list: [
									{
										time: 0,
										value: 0.74,
									},
									{
										time: 1,
										value: 0,
									},
								],
							},
						},
					},
					{
						type: 'moveSpeed',
						config: {
							speed: {
								list: [
									{
										time: 0,
										value: 300,
									},
									{
										time: 1,
										value: 0,
									},
								],
							},
						},
					},
					{
						type: 'scale',
						config: {
							scale: {
								list: [
									{
										time: 0,
										value: 5,
									},
									{
										time: 1,
										value: 1.2,
									},
								],
							},
							minMult: 1,
						},
					},
					{
						type: 'color',
						config: {
							color: {
								list: [
									{
										time: 0,
										value: 'fb1010',
									},
									{
										time: 1,
										value: 'f5b830',
									},
								],
							},
						},
					},
					{
						type: 'rotation',
						config: {
							accel: 0,
							minSpeed: 0,
							maxSpeed: 200,
							minStart: 0,
							maxStart: 360,
						},
					},
					{
						type: 'textureRandom',
						config: {
							textures: [
								Texture.from('https://pixijs.io/particle-emitter/examples/images/particle.png'),
							],
						},
					},
					{
						type: 'spawnPoint',
						config: {},
					},
				],
			}}
		/>
	</>
);
