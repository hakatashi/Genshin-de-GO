import {Stage} from '@pixi/react';
import './App.css';
import {HomeScene} from './scenes/HomeScene';

const App = () => (
	<div className="App">
		<Stage
			width={960}
			height={540}
			options={{backgroundAlpha: 0}}
			style={{
				width: '100vw',
				height: '100vh',
				objectFit: 'contain',
			}}
		>
			<HomeScene/>
		</Stage>
	</div>
);

export default App;
