import {Container, Text} from '@pixi/react';
import {TextMetrics, TextStyle} from 'pixi.js';
import React, {useEffect, useState} from 'react';
import {QuizConfig} from '../lib/types';

const defaultProps = {
	showAnswer: false,
	scale: 1,
};

type KanjiProps = {
	quiz: QuizConfig,
	x: number,
	y: number,
	maxWidth: number,
	scale?: number,
	style: TextStyle,
	showAnswer?: boolean,
} & typeof defaultProps;

const Kanji = (props: KanjiProps) => {
	const {
		quiz: {kanji, answers, prefix, suffix},
		x,
		y,
		style,
		showAnswer,
		maxWidth,
		scale,
	} = props;

	const [kanjiMetrics, setKanjiMetrics] = useState<TextMetrics | null>(null);
	const [answerOffset, setAnswerOffset] = useState(0);
	const [answerZoom, setAnswerZoom] = useState(1);
	const [answerTextStyle, setAnswerTextStyle] = useState<TextStyle>(style);
	const [prefixTextStyle, setPrefixTextStyle] = useState<TextStyle>(style);

	useEffect(() => {
		const fontSize = typeof style.fontSize === 'number' ? style.fontSize : parseInt(style.fontSize);

		const newAnswerTextStyle = style.clone();
		newAnswerTextStyle.fontSize = fontSize * 0.4;
		setAnswerTextStyle(newAnswerTextStyle);

		const newPrefixTextStyle = style.clone();
		newPrefixTextStyle.fontSize = fontSize * 0.7;
		newPrefixTextStyle.fill = '#ffffff';
		setPrefixTextStyle(newPrefixTextStyle);
	}, [style]);

	useEffect(() => {
		const newKanjiMetrics = TextMetrics.measureText(kanji, style);
		setKanjiMetrics(newKanjiMetrics);
	}, [kanji, style]);

	useEffect(() => {
		const prefixMetrics = TextMetrics.measureText(prefix, prefixTextStyle);
		const suffixMetrics = TextMetrics.measureText(suffix, prefixTextStyle);
		const kanjiWidth = kanjiMetrics?.width ?? 0;
		const prefixWidth = prefixMetrics.width ?? 0;
		const suffixWidth = suffixMetrics.width ?? 0;
		const totalWidth = kanjiWidth + prefixWidth + suffixWidth;

		const newAnswerZoom = totalWidth < maxWidth ? 1 : maxWidth / totalWidth;
		const newAnswerOffset = (prefixWidth - suffixWidth) / 2;

		setAnswerOffset(newAnswerOffset);
		setAnswerZoom(newAnswerZoom);
	}, [kanjiMetrics, prefix, suffix, prefixTextStyle, maxWidth]);

	return (
		<Container
			x={x}
			y={y}
			scale={answerZoom * scale}
			pivot={[-answerOffset, 0]}
		>
			<Text
				text={kanji}
				x={0}
				y={47}
				anchor={[0.5, 1]}
				style={style}
			/>
			{showAnswer === true && (
				<Text
					text={answers[0]}
					x={0}
					y={-28}
					anchor={[0.5, 0.5]}
					style={answerTextStyle}
				/>
			)}
			{typeof kanjiMetrics?.width === 'number' && (
				<>
					<Text
						text={prefix}
						x={-kanjiMetrics.width * 0.9 / 2}
						y={42}
						anchor={[1, 1]}
						style={prefixTextStyle}
					/>
					<Text
						text={suffix}
						x={kanjiMetrics.width * 0.9 / 2}
						y={42}
						anchor={[0, 1]}
						style={prefixTextStyle}
					/>
				</>
			)}
		</Container>
	);
};

Kanji.defaultProps = defaultProps;

const PureKanji = React.memo(Kanji);

export {PureKanji as Kanji};
