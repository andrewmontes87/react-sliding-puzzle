import React, {Component} from 'react';
import Node from '../../helpers/Node';
import AStar from '../../helpers/AStar';

export default class PuzzleBox extends Component {

  constructor(props) {
    super(props);
    this.state = {
      dim: 3,
      solutionMatrix: [],
      puzzleMatrix: [],
      emptyPos: [0, 0],
      lastMoves: [],
      isSolved: true
    };
  }

  // ON MOUNT, SHUFFLE THE BOARD
  componentDidMount() {
    this.shufflePuzzle(this.state.dim);
  }

  //
  // PUZZLE FUNCTIONS
  //

  // puzzle pieces take the shape:
  // [value, [rowPosition, columnPosition]]
  // e.g. the first piece is [1, [0, 0]]
  // e.g. the sixth piece is [6, [1, 2]]

  // CREATE A NEW SOLVED BOARD
  prepData(dim) {
    const data = [];
    for (let idx = 0; idx < dim; idx++) {
      data.push([]);
      for (let nidx = 1 + (idx * dim); nidx <= dim + (idx * dim); nidx++) {
        // [value, [rowPosition, columnPosition]]
        const piece = [
          nidx,
          [idx, nidx - 1 - (idx * dim)]
        ];
        data[idx].push(piece);
      }
    }
    // add empty piece to the end
    data[dim - 1][dim - 1] = [
      0,
      [dim - 1, dim - 1]
    ];
    return data;
  }

  // CHECK IF THE BOARD IS SOLVED
  checkIfSolved(puzzleMatrix, solutionMatrix) {
    return JSON.stringify(puzzleMatrix) === JSON.stringify(solutionMatrix);
  }

  // MOVE AN ELEMENT TO THE EMPTY SPACE IN A PUZZLE MATRIX
  moveElement(puzzleMatrix, row, cell, empty) {
    const dim = puzzleMatrix.length;
    const clickedElement = puzzleMatrix[row][cell];
    let emptyPos = empty;


    // if already the empty cell, return untouched puzzleMatrix
    if (puzzleMatrix[row][cell] === 0) return puzzleMatrix;

    // check the value of pieces around the clickedElement
    // pieces are [value, [rowPosition, columnPosition]]
    // -1 means we're at the edge
    // 0 means it's the empty space
    // number means it's another puzzle piece
    const pieceAboveClickedElement = row > 0 ? puzzleMatrix[row - 1][cell][0] : -1;
    const pieceToRightOfClickedElement = cell < dim - 1 ? puzzleMatrix[row][cell + 1][0] : -1;
    const pieceBelowClickedElement = row < dim - 1 ? puzzleMatrix[row + 1][cell][0] : -1;
    const pieceToLeftOfClickedElement = cell > 0 ? puzzleMatrix[row][cell - 1][0] : -1;

    // if any of the nearby cells are the empty, swap places
    // update position of the piece [value, [rowPosition, columnPosition]]
    // using ! means that the edges (-1) don't trigger anything
    let pieceMoved = false;
    if (!pieceAboveClickedElement) {
      pieceMoved = true;
      clickedElement[1] = [row - 1, cell];
      puzzleMatrix[row - 1][cell] = clickedElement;
    } else if (!pieceToRightOfClickedElement) {
      pieceMoved = true;
      clickedElement[1] = [row, cell + 1];
      puzzleMatrix[row][cell + 1] = clickedElement;
    } else if (!pieceBelowClickedElement) {
      pieceMoved = true;
      clickedElement[1] = [row + 1, cell];
      puzzleMatrix[row + 1][cell] = clickedElement;
    } else if (!pieceToLeftOfClickedElement) {
      pieceMoved = true;
      clickedElement[1] = [row, cell - 1];
      puzzleMatrix[row][cell - 1] = clickedElement;
    }

    // if we moved a piece, put the empty in the place of the element we just moved
    // and track it as a recent move
    if (pieceMoved) {
      emptyPos = [row, cell];
      // [value, [rowPosition, columnPosition]]
      puzzleMatrix[row][cell] = [
        0,
        emptyPos
      ];
      this.state.lastMoves.unshift(clickedElement[0]);
    }

    return [puzzleMatrix, emptyPos];
  }

  // FIND A RANDOM NEXT PIECE TO SLIDE TO THE EMPTY SPACE
  findRandomNext(puzzleMatrix, empty) {
    const dim = puzzleMatrix.length;
    const lastMove = this.state.lastMoves[0];
    const possibleMoves = [];

    // find the row, column indexes of the empty space
    const ri = empty[0];
    const ci = empty[1];

    // row, column indexes of the surrounding pieces in four directions
    // will be null if not a valid piece (e.g. at the edge of the board)
    const topri = ri - 1 >= 0 ? ri - 1 : null;
    const topci = ci;
    const rightri = ri;
    const rightci = ci + 1 < dim ? ci + 1 : null;
    const bottomri = ri + 1 < dim ? ri + 1 : null;
    const bottomci = ci;
    const leftri = ri;
    const leftci = ci - 1 >= 0 ? ci - 1 : null;

    // check four directions for possible moves
    // if both row and column indexes are not null,
    // that piece could be the randomly selected next move
    if (topri !== null && topci !== null) {
      possibleMoves.push([topri, topci]);
    }
    if (rightri !== null && rightci !== null) {
      possibleMoves.push([rightri, rightci]);
    }
    if (bottomri !== null && bottomci !== null) {
      possibleMoves.push([bottomri, bottomci]);
    }
    if (leftri !== null && leftci !== null) {
      possibleMoves.push([leftri, leftci]);
    }

    // helper to choose a random move
    const selectRandomMove = (moves) => {
      return moves[Math.floor(Math.random() * moves.length)];
    };

    // prime with a first try at a random move
    let randomMove = selectRandomMove(possibleMoves);
    // make sure we don't repeat the last move
    // check the value of the selected random move
    // lastMove is a value, check if it matches the selected random
    // if so select another random move
    while (puzzleMatrix[randomMove[0]][randomMove[1]][0] === lastMove) {
      randomMove = selectRandomMove(possibleMoves);
    }

    return randomMove;
  }

  //
  // ASTAR HANDLER
  // click handler for AStar solution algorithm
  //
  solvePuzzle() {
    let puzzleMatrix = this.state.puzzleMatrix;
    let empty = this.state.emptyPos;
    const dim = this.state.dim;
    const solutionMatrix = this.state.solutionMatrix;

    // format current and solution board to just values
    const puzzleBoard = puzzleMatrix.map( (row) => {
      return row.map( (cell) => {
        return cell[0];
      });
    });

    const solutionBoard = solutionMatrix.map( (row) => {
      return row.map( (cell) => {
        return cell[0];
      });
    });

    const init = new Node(0, puzzleBoard, empty[0], empty[1], 0);
    const goal = new Node(0, solutionBoard, dim - 1, dim - 1, 0);

    const astar = new AStar(init, goal, 0);

    const solutionPath = astar.path.split('');

    const interval = setInterval( () => {
      const result = this.directionHandler(solutionPath.shift(), puzzleMatrix, empty);
      puzzleMatrix = result[0];
      empty = result[1];
      const solved = this.checkIfSolved(puzzleMatrix, solutionMatrix);
      this.setState({
        puzzleMatrix: puzzleMatrix,
        emptyPos: empty,
        isSolved: solved
      });
      if (!solutionPath.length) clearInterval(interval);
    }, 1000);
  }


  //
  // UI HANDLERS
  //

  // DROPDOWN FORM HANDLERS
  handleNChange(event) {
    const dim = parseInt(event.target.value, 10);
    this.shufflePuzzle(dim);
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  //
  // STATE SETTER UI HANDLERS
  //

  // BUILD A SOLVED BOARD AND SET STATE
  resetPuzzle(dim) {
    const puzzleMatrix = this.prepData(dim);
    const solutionMatrix = this.prepData(dim);
    const emptyPos = [dim - 1, dim - 1];
    this.setState({
      dim: dim,
      puzzleMatrix: puzzleMatrix,
      solutionMatrix: solutionMatrix,
      emptyPos: emptyPos,
      lastMoves: [],
      isSolved: true
    });
  }

  // BUILD A SHUFFLED BOARD AND SET STATE
  shufflePuzzle(dim) {
    const minShuffle = dim;
    const maxShuffle = dim * 3;
    const steps = Math.floor(Math.random() * (maxShuffle - minShuffle + 1)) + minShuffle;
    const solutionMatrix = this.prepData(dim);
    let puzzleMatrix = this.prepData(dim);
    let empty = [dim - 1, dim - 1];
    // accessing state?
    this.state.lastMoves = [];
    let solved;
    for (let vg = 0; vg < steps; vg++) {
      const next = this.findRandomNext(puzzleMatrix, empty);
      const moveResults = this.moveElement(puzzleMatrix, next[0], next[1], empty);
      puzzleMatrix = moveResults[0];
      empty = moveResults[1];
      solved = this.checkIfSolved(puzzleMatrix, this.state.solutionMatrix);
    }
    this.setState({
      dim: dim,
      puzzleMatrix: puzzleMatrix,
      solutionMatrix: solutionMatrix,
      emptyPos: empty,
      isSolved: solved
    });
  }

  directionHandler(direction, puzMatrix, emp) {
    let puzzleMatrix = puzMatrix;
    let empty = emp;
    let next;

    if (direction === 'U') {
      next = [empty[0] - 1, empty[1]];
    }
    if (direction === 'R') {
      next = [empty[0], empty[1] + 1];
    }
    if (direction === 'D') {
      next = [empty[0] + 1, empty[1]];
    }
    if (direction === 'L') {
      next = [empty[0], empty[1] - 1];
    }

    const result = this.moveElement(puzzleMatrix, next[0], next[1], empty);
    puzzleMatrix = result[0];
    empty = result[1];

    return [puzzleMatrix, empty];
  }


  render() {
    const styles = require('./PuzzleBox.scss');

    // UI HANDLER TO MOVE A CLICKED TILE AND SET STATE
    const moveElementHandler = (ridx, cidx) => {
      let puzzleMatrix = this.state.puzzleMatrix;
      let empty = this.state.emptyPos;
      const moveResults = this.moveElement(puzzleMatrix, ridx, cidx, empty);
      puzzleMatrix = moveResults[0];
      empty = moveResults[1];
      const solved = this.checkIfSolved(puzzleMatrix, this.state.solutionMatrix);
      this.setState({
        puzzleMatrix: puzzleMatrix,
        emptyPos: empty,
        isSolved: solved
      });
    };

    return (<div>
        <form onSubmit={this.handleSubmit.bind(this)}>
          <label>
            Pick the size of your puzzle:&nbsp;
            <select value={parseInt(this.state.dim, 10)} onChange={this.handleNChange.bind(this)}>
              <option value="3">3 x 3</option>
              <option value="4">4 x 4</option>
              <option value="5">5 x 5</option>
            </select>
          </label>
        </form>
        <button className={styles.shuffleButton} onClick={this.shufflePuzzle.bind(this, this.state.dim)}>Shuffle</button>
        <button className={styles.shuffleButton} onClick={this.solvePuzzle.bind(this)}>Solve</button>
        <button className={styles.shuffleButton} onClick={this.resetPuzzle.bind(this, this.state.dim)}>Reset</button>
        {
          ( this.state.isSolved ) ?
          (<h3>Status: Solved</h3>) :
          (<h3>Status: Unsolved</h3>)
        }
        <table key={'table'} className={ this.state.isSolved ? styles.puzzleBox + ' ' + styles.solvedPuzzle : styles.puzzleBox}>
          <tbody key={'tbody'}>
            {
              this.state.puzzleMatrix.map(function puzzleRow(row, ridx) {
                return (
                  <tr key={'tr-' + ridx}>{
                    row.map(function puzzleCell(cell, cidx) {
                      const val = cell[0];
                      return (val > 0)
                      ? (<td key={'td-' + ridx + '-' + cidx + '-' + val} className={styles.fullCell}
                            onClick={moveElementHandler.bind(this, ridx, cidx)}>
                              {val}
                            </td>)
                      : (<td key={'td-' + ridx + '-' + cidx + '-' + val} className={styles.emptyCell}>&nbsp;</td>);
                    })
                  }</tr>
                );
              }, this)
            }
          </tbody>
        </table>
        <h4 className={styles.movesListTitle}>Most Recent Moves</h4>
        <ol>
        {
          this.state.lastMoves.map( (move) => {
            return (
              <li><h5>{move}</h5></li>
            );
          })
        }
        {
          (!this.state.lastMoves.length) ?
          (<h5>No moves yet</h5>) :
          null
        }
        </ol>
    </div>);
  }
}
