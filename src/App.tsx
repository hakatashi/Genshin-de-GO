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

	const inputRef = useCallback((el: HTMLInputElement | null) => {
		if (el) {
			el.focus();
		}
	}, []);

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
				{isInputShown === true && (
					<form className="App-AnswerForm" autoComplete="off" onSubmit={onSubmit}>
						<input
							type="text"
							name="text"
							className="App-AnswerInput"
							ref={inputRef}
							value={text}
							onInput={onInput}
						/>
					</form>
				)}
			</div>
		</div>
	);
};

export default App;
