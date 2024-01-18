import {Stage} from '@pixi/react';
import './App.css';
import {RecoilRoot} from 'recoil';
import SceneWrapper from './SceneWrapper';

const App = () => (
	<div className="App">
		<div className="App-GameWrap">
			<Stage
				width={960}
				height={540}
				options={{
					backgroundAlpha: 0,
				}}
				className="App-Game"
			>
				<RecoilRoot>
					<SceneWrapper/>
				</RecoilRoot>
			</Stage>
			<input type="text" className="App-AnswerInput"/>
		</div>
	</div>
);

export default App;
