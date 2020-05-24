import '../css/base.scss';

import { sortBy } from 'lodash-es';

import { COLOR_TEXT_MAP } from '~/constants/Apps';
import { ePlayerColor } from '~/enums/Apps';

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

const elPlayButton = document.getElementById('play-button') as HTMLButtonElement;
const elCountBlack = document.getElementById('count-black') as HTMLInputElement;
const elCountWhite = document.getElementById('count-white') as HTMLInputElement;
const elMessage = document.getElementById('message') as HTMLDivElement;

if (elPlayButton && elCountBlack && elCountWhite && elMessage) {
  othello.event.on('num-stones', (numStoneMap) => {
    elCountBlack.value = String(numStoneMap[ePlayerColor.Black]);
    elCountWhite.value = String(numStoneMap[ePlayerColor.White]);
  });

  othello.event.on('own-turn', (color: ePlayerColor) => {
    elMessage.innerText = `${COLOR_TEXT_MAP[color]}の番`;
  });

  othello.event.on('pass', (color: ePlayerColor) => {
    window.alert(`置く場所がないため${COLOR_TEXT_MAP[color]}の番はパスします。`);
  });

  othello.event.on('finish', (numStoneMap) => {
    window.alert('ゲーム終了');

    const numStones = Object.keys(numStoneMap).map((color: any) => ({
      color: color as ePlayerColor,
      count: numStoneMap[color],
    }));
    const sortedNumStones = sortBy(numStones, (numStone) => numStone.count).reverse();

    // 一人だけ最大値を出せている場合は勝者を表示する
    if (sortedNumStones[0].count > sortedNumStones[1].count) {
      elMessage.innerText = `${COLOR_TEXT_MAP[sortedNumStones[0].color]}の勝ち`;
      return;
    }

    // そうでない場合は引き分けを表示する
    elMessage.innerText = '引き分け';
  });
}
othello.reset(othelloData);
othello.start();
