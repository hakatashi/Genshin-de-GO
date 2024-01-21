import {Container, Text} from '@pixi/react';
import {TextStyle, Texture} from 'pixi.js';
import {useRecoilState} from 'recoil';
import dictionary from '../../data/dictionary';
import {sceneState} from '../atoms';
import {Button} from '../components/Button';
import {ExplanationDialog} from '../components/ExplanationDialog';
import {Emitter} from '../components/Particles';

export const HomeScene = () => {
	const [, setScene] = useRecoilState(sceneState);

	return (
		<Container>
			<Emitter
				config={{
					lifetime: {
						min: 0.1,
						max: 0.75,
					},
					frequency: 0.0003,
					emitterLifetime: 0,
					maxParticles: 5000,
					addAtBack: false,
					pos: {
						x: 480,
						y: 270,
					},
					behaviors: [
						{
							type: 'alpha',
							config: {
								alpha: {
									list: [
										{
											time: 0,
											value: 0.7,
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
							type: 'moveSpeedStatic',
							config: {
								min: 200,
								max: 200,
							},
						},
						{
							type: 'scale',
							config: {
								scale: {
									list: [
										{
											time: 0,
											value: 0.8,
										},
										{
											time: 1,
											value: 1,
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
											value: 'fff191',
										},
										{
											time: 1,
											value: 'ff622c',
										},
									],
								},
							},
						},
						{
							type: 'rotation',
							config: {
								accel: 0,
								minSpeed: 50,
								maxSpeed: 50,
								minStart: 265,
								maxStart: 275,
							},
						},
						{
							type: 'textureRandom',
							config: {
								textures: [
									Texture.from('https://pixijs.io/particle-emitter/examples/images/particle.png'),
									// Texture.from('https://pixijs.io/particle-emitter/examples/images/Fire.png'),
								],
							},
						},
						{
							type: 'spawnShape',
							config: {
								type: 'rect',
								data: {
									x: -350,
									y: 0,
									w: 700,
									h: 0,
								},
							},
						},
					],
				}}
			/>
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
				onClick={() => setScene('quiz')}
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
			<ExplanationDialog x={0} y={440} quiz={dictionary[79]}/>
		</Container>
	);
};

