import {Stage as PixiStage, _ReactPixi} from '@pixi/react';
// eslint-disable-next-line camelcase
import {useRecoilBridgeAcrossReactRoots_UNSTABLE} from 'recoil';

export const Stage = (props: _ReactPixi.IStage) => {
	const RecoilBridge = useRecoilBridgeAcrossReactRoots_UNSTABLE();

	return (
		<PixiStage {...props}>
			<RecoilBridge>
				{props.children}
			</RecoilBridge>
		</PixiStage>
	);
};
