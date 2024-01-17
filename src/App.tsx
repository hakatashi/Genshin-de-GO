import {Stage, Container} from '@pixi/react';
import './App.css';
import {Bunny} from './Bunny';

const App = () => (
	<div className="App">
		<header className="App-header">
			<Stage width={1000} height={1000} options={{backgroundAlpha: 0}}>
				<Container x={150} y={150}>
					<Bunny/>
				</Container>
			</Stage>
		</header>
	</div>
);

export default App;
