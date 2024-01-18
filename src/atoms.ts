import {atom} from 'recoil';

export const sceneState = atom<'home' | 'quiz'>({
	key: 'sceneState',
	default: 'home',
});

export const isInputShownState = atom<boolean>({
	key: 'isInputShownState',
	default: false,
});

export const inputTextState = atom<string>({
	key: 'inputTextState',
	default: '',
});

export const textInputTimeState = atom<number | null>({
	key: 'textInputTimeState',
	default: null,
});
