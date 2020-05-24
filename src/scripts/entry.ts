import '../css/base.scss';

import { sortBy } from 'lodash-es';

import { COLOR_TEXT_MAP } from '~/constants/Apps';
import { ePlayerColor, ePlayerType } from '~/enums/Apps';

import Othello from './apps/Othello';

import othelloData1 from './data/othello.json';
import othelloData2 from './data/othello2.json';

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
const elTableSelect = document.getElementById('table-select') as HTMLSelectElement;
const elPlayerTypeSelectBlack = document.getElementById('player-type-select-black') as HTMLSelectElement;
const elPlayerTypeSelectWhite = document.getElementById('player-type-select-white') as HTMLSelectElement;
const elCountBlack = document.getElementById('count-black') as HTMLInputElement;
const elCountWhite = document.getElementById('count-white') as HTMLInputElement;
const elMessage = document.getElementById('message') as HTMLDivElement;

const OTHELLO_DATA_OPTIONS = [
  { id: 'othello-0', name: '盤面1', data: othelloData1 },
  { id: 'othello-1', name: '盤面2', data: othelloData2 },
];
elTableSelect.value = 'othello-0';

const PLAYER_TYPE_OPTIONS = [
  { id: ePlayerType.Human, name: '人間' },
];
elPlayerTypeSelectBlack.value = ePlayerType.Human;
elPlayerTypeSelectWhite.value = ePlayerType.Human;

/**
 * オセロデータを返す
 */
function getOthelloData() {
  const othelloId = elTableSelect.value;
  const option = OTHELLO_DATA_OPTIONS.find((OTHELLO_DATA_OPTION) => OTHELLO_DATA_OPTION.id === othelloId);
  if (!option) {
    return [[]];
  }
  return option.data;
}

OTHELLO_DATA_OPTIONS.forEach((OTHELLO_DATA_OPTION) => {
  const elOption = document.createElement('option');
  elOption.value = OTHELLO_DATA_OPTION.id;
  elOption.innerText = OTHELLO_DATA_OPTION.name;
  elTableSelect.appendChild(elOption);
});

PLAYER_TYPE_OPTIONS.forEach((PLAYER_TYPE_OPTION) => {
  const elOption = document.createElement('option');
  elOption.value = PLAYER_TYPE_OPTION.id;
  elOption.innerText = PLAYER_TYPE_OPTION.name;
  elPlayerTypeSelectBlack.appendChild(elOption.cloneNode(true));
  elPlayerTypeSelectWhite.appendChild(elOption.cloneNode(true));
});

if (elPlayButton && elTableSelect && elCountBlack && elCountWhite && elMessage) {
  elTableSelect.addEventListener('change', () => {
    othello.reset(getOthelloData());
  });

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

  othello.event.on('reset', () => {
    elMessage.innerText = '左上の「開始」ボタンをクリックして始めてください。';
    elTableSelect.removeAttribute('disabled');
    elPlayerTypeSelectBlack.removeAttribute('disabled');
    elPlayerTypeSelectWhite.removeAttribute('disabled');
  });

  const getPlayButtonText = () => {
    return othello.isPlaying ? 'リセット' : '開始';
  };
  elPlayButton.innerText = getPlayButtonText();
  elPlayButton.addEventListener('click', () => {
    if (!othello.isPlaying) {
      window.alert('ゲームスタート');
      elTableSelect.setAttribute('disabled', 'true');
      elPlayerTypeSelectBlack.setAttribute('disabled', 'true');
      elPlayerTypeSelectWhite.setAttribute('disabled', 'true');
      othello.start(
        elPlayerTypeSelectBlack.value as ePlayerType,
        elPlayerTypeSelectWhite.value as ePlayerType,
      );
      elPlayButton.innerText = getPlayButtonText();
      return;
    }

    if (window.confirm('リセットしてもよろしいですか？')) {
      othello.reset(getOthelloData());
      elPlayButton.innerText = getPlayButtonText();
    }
  });
}
othello.reset(getOthelloData());
