import '../css/base.scss';

import Othello from './apps/Othello';

import othelloData from './data/othello.json';

const WIDTH = 500;
const HEIGHT = 500;

const elCanvas = document.createElement('canvas');
elCanvas.width = WIDTH;
elCanvas.height = HEIGHT;
const appElement = document.getElementById('app');
appElement?.appendChild(elCanvas);

const BOARD_SIZE = 8;
const NUM_DIVISION = 8;
const othello = new Othello(elCanvas, BOARD_SIZE, NUM_DIVISION);

othello.reset(othelloData);
othello.start();
