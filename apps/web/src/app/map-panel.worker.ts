/// <reference lib="webworker" />

console.log("map worker loaded");

const LETTERS = 'ABCDEFGHIKLMNOPQRSTUVWXYZ'.split('');

addEventListener('message', async ({ data }) => {
  const { mapData, colors, containerWidth, containerHeight } = data;
  const result = await buildMapData(mapData, colors, containerWidth, containerHeight);
  postMessage(result);
});

interface Label {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
}

interface Line {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface NumberText {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fill: string;
}

interface NumberLine {
  points: number[];
  stroke: string;
  strokeWidth: number;
}

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  opacity: number;
  stroke?: string;
  strokeWidth?: number;

}

interface MapData {
  labels: Label[];
  lines: Line[];
  numberTexts: NumberText[];
  numberLines: NumberLine[];
  boxes: Box[];
  heightOffset: number;
  widthOffset: number;
  labelFontSize: number;
  lineSpacing: number;
  distance: number;
  boxHeight: number;
  boxWidth: number;
  border: number;
}


async function buildMapData(data: number[][], colors: Record<string, string>, containerWidth: number, containerHeight: number): Promise<MapData> {

  const heightOffset = 10;
  const widthOffset = 15;
  const labelFontSize = 10;
  const labelPositioningCorrection = labelFontSize / 2;

  const lineSpacing = (containerHeight - heightOffset) / data.length;
  const distance = heightOffset + lineSpacing / 2;

  const maxNumber = data[0].length;
  const multiplesOfFive = Math.floor(maxNumber / 5);
  const widthPerFive = (containerWidth - widthOffset) / multiplesOfFive;

  const boxHeight = lineSpacing;
  const boxWidth = (containerWidth - widthOffset) / data[0].length;
  const border = 2;

  const labels = data.map((_, index) => ({
    x: 2,
    y: distance + index * lineSpacing - labelPositioningCorrection,
    text: LETTERS[index],
    fontSize: labelFontSize,
    fill: colors['label'],
  }));

  const lines = data.map((_, index) => ({
    points: [0, distance + index * lineSpacing, containerWidth, distance + index * lineSpacing],
    stroke: colors['grid'],
    strokeWidth: 1,
  }));

  const numberTexts = [];
  const numberLines = [];
  for (let i = 1; i < multiplesOfFive; i++) {
    const xPos = widthOffset + i * widthPerFive;
    numberTexts.push({
      x: xPos - labelPositioningCorrection,
      y: 0,
      text: (i * 5).toString(),
      fontSize: labelFontSize,
      fill: colors['label'],
    });
    numberLines.push({
      points: [xPos, 0, xPos, containerHeight],
      stroke: colors['grid'],
      strokeWidth: 1,
    });
  }

  const boxes = [];
  for (let column = 0; column < data[0].length; column++) {
    const xPos = widthOffset + column * boxWidth - boxWidth / 2;
    if (data[0][column] === -2) {
      boxes.push({
        x: xPos,
        y: heightOffset,
        width: boxWidth,
        height: containerHeight - heightOffset,
        fill: colors['boxColor'],
        opacity: 1,
      });
    }
    for (let row = 0; row < data.length; row++) {
      if (data[row][column] !== -1) {
        const isOutOfOrder = data[row][column] !== column;
        const fill = isOutOfOrder ? colors['altBoxColor'] : colors['boxColor'];
        boxes.push({
          x: xPos,
          y: distance + row * boxHeight - boxHeight / 2,
          width: boxWidth,
          height: boxHeight,
          fill,
          opacity: 0.5,
          stroke: colors['boxBorderColor'],
          strokeWidth: border,
        });
      }
    }
  }

  return { labels, lines, numberTexts, numberLines, boxes, heightOffset, widthOffset, labelFontSize, lineSpacing, distance, boxHeight, boxWidth, border };
}
