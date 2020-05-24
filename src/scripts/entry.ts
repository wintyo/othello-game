import '../css/base.scss';

import Othello from './apps/Othello';

import othelloData from './data/othello2.json';

const WIDTH = 500;
const HEIGHT = 500;

const elCanvas = document.createElement('canvas');
elCanvas.width = WIDTH;
elCanvas.height = HEIGHT;
const appElement = document.getElementById('app');
appElement?.appendChild(elCanvas);

const BOARD_SIZE = 10;
const othello = new Othello(elCanvas, BOARD_SIZE);

othello.reset(othelloData);
othello.start();
