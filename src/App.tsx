import './App.css';
import type React from 'react';
import {useState, useCallback} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import SceneWrapper from './SceneWrapper';
import {Stage} from './Stage';
import {inputTextState, isInputShownState, textInputTimeState} from './atoms';

const App = () => {
	const [text, setText] = useState<string>('');

	const isInputShown = useRecoilValue(isInputShownState);
	const [, setInputText] = useRecoilState(inputTextState);
	const [, setTextInputTime] = useRecoilState(textInputTimeState);

	const onSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setText('');
		setInputText(text);
		setTextInputTime(Date.now());
	}, [text, setInputText, setTextInputTime]);

	const onInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
		setText(event.currentTarget.value);
	}, []);

	return (
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
					<SceneWrapper/>
				</Stage>
				{isInputShown ? (
					<form className="App-AnswerForm" onSubmit={onSubmit}>
						<input
							type="text"
							name="text"
							className="App-AnswerInput"
							value={text}
							onInput={onInput}
						/>
					</form>
				) : null}
			</div>
		</div>
	);
};

export default App;
