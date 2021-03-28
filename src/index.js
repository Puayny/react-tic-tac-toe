import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    <button
      className={'square' + (props.isWinningCell ? " winning-square" : "")}
      onClick={() => props.onClick()
      }
    >
      { props.value}
    </button >
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        isWinningCell={this.props.winningCells.includes(i)}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    let cells = []
    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
      let currCols = []
      for (let colIdx = 0; colIdx < 3; colIdx++) {
        let i = rowIdx * 3 + colIdx;
        currCols.push(this.renderSquare(i));
      }
      let currRow = <div key={rowIdx} className="board-row">{currCols}</div>;
      cells.push(currRow);
    }
    return (
      <div>
        {cells}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          'squares': Array(9).fill(null),
          'player': null,
          'move': null,
        }
      ],
      'isXNext': true,
      'result': null,
      'winningCells': [],
      'moveIdx': 0,
      'isHistoryOrderReverse': false,
    }
  }

  static getRowColFromCellIdx(idx) {
    // Retrieve row and column from cell index
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    return [rowIdx, colIdx];
  }

  handleClick(i) {
    const history = this.state['history'].slice(0, this.state['moveIdx'] + 1);
    const currSquares = history[this.state['moveIdx']]['squares'];
    let squares = currSquares.slice();
    // Ignore if there's alr a result, or square alr filled
    if (this.state['result'] || squares[i]) { return; }
    squares[i] = this.getNextPlayerSymbol();
    const { result, winningCells } = calculateResult(squares);

    const lastMoveHistory = {
      'squares': squares,
      'player': squares[i],
      'move': Game.getRowColFromCellIdx(i),
    }

    this.setState({
      'history': history.concat([lastMoveHistory]),
      'isXNext': !this.state['isXNext'],
      'result': result,
      'winningCells': winningCells,
      'moveIdx': this.state['moveIdx'] + 1,
    });
  }

  getNextPlayerSymbol() {
    return this.state['isXNext'] ? 'X' : 'O';
  }

  jumpToStoredMove(moveIdx) {
    // Update win status
    const currSquares = this.state['history'][moveIdx]['squares'];
    const { result, winningCells } = calculateResult(currSquares);

    this.setState({
      'moveIdx': moveIdx,
      'isXNext': moveIdx % 2 === 0 ? true : false,
      'result': result,
      'winningCells': winningCells,
    });
  }

  render() {
    // Get current squares
    const history = this.state['history'];
    const currHistory = history[this.state['moveIdx']];

    // Get current status
    let status;
    if (this.state['result'] === "draw") {
      status = "Draw";
    } else if (this.state['result']) {
      status = "Winner: " + this.state['result'];
    } else {
      status = 'Next player: ' + this.getNextPlayerSymbol();
    }

    // Get history
    // Check whether to display in reverse order
    let moveIdxsToDisplay = [...Array(history.length).keys()];
    if (this.state['isHistoryOrderReverse']) {
      moveIdxsToDisplay.reverse();
    }

    const movesHistory = moveIdxsToDisplay.map(moveIdx => {
      let desc;
      if (moveIdx === 0) {
        desc = "Go to game start";
      } else {
        desc = `Go to move #${moveIdx}. 
        Last move: ${history[moveIdx]['move']} by 
        ${history[moveIdx]['player']}`;
      };

      // Different style for currently selected move
      let buttonClass = null;
      if (moveIdx === this.state.moveIdx) {
        buttonClass = "history-selected-move";
      }
      return (
        <li key={moveIdx} value={moveIdx + 1}>
          <button
            onClick={() => this.jumpToStoredMove(moveIdx)}
            className={buttonClass}
          >
            {desc}
          </button>
        </li>
      )

    });

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={currHistory['squares']}
            onClick={(i) => this.handleClick(i)}
            winningCells={this.state.winningCells}
          />
        </div>
        <div className="game-info">
          <div className='status'>
            {status}
          </div>
          <div>
            <input
              type="checkbox" id="history-ordering" name="history-ordering"
              onClick={() => {
                let isHistoryOrderReverse = document.getElementById("history-ordering").checked;
                this.setState({ 'isHistoryOrderReverse': isHistoryOrderReverse });
              }}>
            </input>
            <label for="history-ordering">Reverse move history order</label>
          </div>
          <ol>{movesHistory}</ol>
        </div>
      </div >
    );
  }
}


function calculateResult(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // Has winner
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { 'result': squares[a], 'winningCells': [a, b, c] };
    }
  }
  // Draw
  if (squares.reduce((sum, ele) => sum + (ele == null ? 1 : 0), 0) === 0) {
    return { 'result': 'draw', 'winningCells': [] }
  }
  // Game not yet over
  return { 'result': null, 'winningCells': [] };
}
// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
