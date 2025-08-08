const board = Chessboard('board', {
  draggable: true,
  position: 'start',
  onDrop: onDrop
});

const game = new Chess();
const engine = new Worker('stockfish.js');

engine.postMessage('uci');

function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';

  board.position(game.fen());
  updateStatus();

  window.setTimeout(makeEngineMove, 250);
}

function makeEngineMove() {
  engine.postMessage('position fen ' + game.fen());
  engine.postMessage('go depth 15');
}

engine.onmessage = function (event) {
  const line = event.data;
  if (line.startsWith('bestmove')) {
    const move = line.split(' ')[1];
    game.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: 'q' });
    board.position(game.fen());
    updateStatus();
  }
};

function updateStatus() {
  const status = document.getElementById('status');
  if (game.in_checkmate()) {
    status.textContent = 'Checkmate!';
  } else if (game.in_draw()) {
    status.textContent = 'Draw!';
  } else {
    status.textContent = game.turn() === 'w' ? 'Your move' : 'Stockfish is thinking...';
  }
}
