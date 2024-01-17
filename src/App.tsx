import {Stage} from '@pixi/react';
import './App.css';
import {HomeScene} from './scenes/HomeScene';

const App = () => (
	<div className="App">
		<header className="App-header">
			<Stage width={1000} height={1000} options={{backgroundAlpha: 0}}>
				<HomeScene/>
			</Stage>
		</header>
	</div>
);

export default App;
