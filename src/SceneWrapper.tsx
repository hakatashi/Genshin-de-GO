import {Container} from '@pixi/react';
import './App.css';
import {useRecoilValue} from 'recoil';
import {sceneState} from './atoms';
import {HomeScene} from './scenes/HomeScene';
import {QuizScene} from './scenes/QuizScene';

const SceneWrapper = () => {
	const scene = useRecoilValue(sceneState);

	return (
		<Container >
			{scene === 'home' && <HomeScene/>}
			{scene === 'quiz' && <QuizScene/>}
		</Container>
	);
};

export default SceneWrapper;

