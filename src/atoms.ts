import {atom} from 'recoil';

export const sceneState = atom<'home' | 'quiz'>({
	key: 'sceneState',
	default: 'home',
});
