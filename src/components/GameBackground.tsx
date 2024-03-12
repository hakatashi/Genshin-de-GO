import {Container, Sprite, useTick} from '@pixi/react';
import {useEffect, useState} from 'react';

interface Tree {
	id: number,
	addTime: number,
	direction: 'left' | 'right',
}

type GameBackgroundProps = {
	active: boolean,
};

const getScale = (time: number) => {
	const distanceY = (60 - time) * 3;
	const distance = Math.sqrt(distanceY ** 2 + 0 ** 2);
	const scale = Math.atan2(20, distance) / Math.PI * 2;
	return scale;
};

const GameBackground = (props: GameBackgroundProps) => {
	const initialTree: Tree = {id: 0, addTime: 0, direction: 'left'};

	const [trees, setTrees] = useState<Tree[]>([initialTree]);
	const [timer, setTimer] = useState<number>(0);
	const [lastTree, setLastTree] = useState<Tree>(initialTree);

	useTick(() => {
		if (!props.active) {
			return;
		}

		const newTimer = timer + 1;
		setTimer(newTimer);

		if (lastTree.addTime + 5 <= newTimer) {
			const newTree: Tree = {
				id: lastTree.id + 1,
				addTime: newTimer,
				direction: lastTree.direction === 'left' ? 'right' : 'left',
			};

			setTrees([newTree, ...trees]);
			setLastTree(newTree);
		}

		for (const tree of trees) {
			if (tree.addTime < newTimer - 60) {
				setTrees(trees.filter((t) => t.id !== tree.id));
			}
		}
	});

	return (
		<Container x={0} y={0} scale={1}>
			{/*
			<Rectangle
				x={0}
				y={480}
				width={960}
				height={60}
				backgroundColor={0x4f1900}
			/>
			*/}
			<Container x={480} y={0} scale={0.8}>
				{trees.map((tree) => (
					<Container
						key={tree.id}
						x={tree.direction === 'left' ? -100 : 100}
						scale={tree.direction === 'left' ? [-1, 1] : [1, 1]}
					>
						{/*
						<AnimatedGIF
							key={tree.id}
							initialFrame={Math.floor((timer - tree.addTime) / 2)}
							options={{
								loop: false,
								animationSpeed: 0.5,
							}}
						/>
						 */}
						<Sprite
							x={0}
							y={500}
							scale={getScale(timer - tree.addTime) * 1.5}
							alpha={(timer - tree.addTime < 10) ? (timer - tree.addTime) / 10 : 1}
							pivot={[0, 1700]}
							image="/tree.png"
						/>
					</Container>
				))}
			</Container>
		</Container>
	);
};

export default GameBackground;
