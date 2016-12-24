import React, {Component} from 'react';

export default class PuzzleBox extends Component {

  constructor(props) {
    super(props);
    const defaultDim = 3;
    const puzzleMatrix = this.prepData(defaultDim);
    const solutionMatrix = this.prepData(defaultDim);
    this.state = {
      dim: defaultDim,
      solutionMatrix: solutionMatrix,
      puzzleMatrix: puzzleMatrix,
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

  // CREATE A NEW SOLVED BOARD
  prepData(dim) {
    const data = [];
    for (let idx = 0; idx < dim; idx++) {
      data.push([]);
      for (let nidx = 1 + (idx * dim); nidx <= dim + (idx * dim); nidx++) {
        data[idx].push(nidx);
      }
    }
    data[dim - 1][dim - 1] = 0;
    return data;
  }

  // CHECK IF THE BOARD IS SOLVED
  checkIfSolved(puzzleMatrix, solutionMatrix) {
    return JSON.stringify(puzzleMatrix) === JSON.stringify(solutionMatrix);
  }

  // FIND THE POSITION OF THE EMPTY SPACE
  findEmpty(puzzleMatrix) {
    const dim = puzzleMatrix.length;
    for (let ir = 0; ir < dim; ir++) {
      for (let ic = 0; ic < dim; ic++) {
        if (!puzzleMatrix[ir][ic]) {
          return {
            row: ir,
            cell: ic
          };
        }
      }
    }
    return null;
  }

  // FIND A RANDOM NEXT PIECE TO SLIDE TO THE EMPTY SPACE
  findRandomNext(puzzleMatrix) {
    const dim = puzzleMatrix.length;
    const lastMove = this.state.lastMoves[0];
    let possibleMoves = [];

    // find the row, column indexes of the empty space
    const empty = this.findEmpty(puzzleMatrix);
    const ri = empty.row;
    const ci = empty.cell;

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

    // helper to track possible moves
    const pushPossibleMove = (moves, rx, cx) => {
      moves.push({
        row: rx,
        cell: cx
      });
      return moves;
    };

    // check four directions for possible moves
    // if both row and column indexes are not null,
    // that piece could be the randomly selected next move
    if (topri !== null && topci !== null) {
      possibleMoves = pushPossibleMove(possibleMoves, topri, topci);
    }
    if (rightri !== null && rightci !== null) {
      possibleMoves = pushPossibleMove(possibleMoves, rightri, rightci);
    }
    if (bottomri !== null && bottomci !== null) {
      possibleMoves = pushPossibleMove(possibleMoves, bottomri, bottomci);
    }
    if (leftri !== null && leftci !== null) {
      possibleMoves = pushPossibleMove(possibleMoves, leftri, leftci);
    }

    // helper to choose a random move
    const selectRandomMove = (moves) => {
      return moves[Math.floor(Math.random() * moves.length)];
    };

    // prime with a first try at a random move
    let randomMove = selectRandomMove(possibleMoves);
    // make sure we don't repeat the last move
    while (puzzleMatrix[randomMove.row][randomMove.cell] === lastMove) {
      randomMove = selectRandomMove(possibleMoves);
    }

    return randomMove;
  }

  // MOVE AN ELEMENT TO THE EMPTY SPACE IN A PUZZLE MATRIX
  moveElement(puzzleMatrix, row, cell) {
    const dim = puzzleMatrix.length;
    const clickedElement = puzzleMatrix[row][cell];

    // if already the empty cell, return untouched puzzleMatrix
    if (puzzleMatrix[row][cell] === 0) return puzzleMatrix;

    // check the pieces around the clickedElement
    // -1 means we're at the edge
    // 0 means it's the empty space
    // number means it's another puzzle piece
    const pieceAboveClickedElement = row > 0 ? puzzleMatrix[row - 1][cell] : -1;
    const pieceToRightOfClickedElement = cell < dim - 1 ? puzzleMatrix[row][cell + 1] : -1;
    const pieceBelowClickedElement = row < dim - 1 ? puzzleMatrix[row + 1][cell] : -1;
    const pieceToLeftOfClickedElement = cell > 0 ? puzzleMatrix[row][cell - 1] : -1;

    // if any of the nearby cells are the empty, swap places
    // using ! means that the edges (-1) don't trigger anything
    let pieceMoved = false;
    if (!pieceAboveClickedElement) {
      pieceMoved = true;
      puzzleMatrix[row - 1][cell] = clickedElement;
    } else if (!pieceToRightOfClickedElement) {
      pieceMoved = true;
      puzzleMatrix[row][cell + 1] = clickedElement;
    } else if (!pieceBelowClickedElement) {
      pieceMoved = true;
      puzzleMatrix[row + 1][cell] = clickedElement;
    } else if (!pieceToLeftOfClickedElement) {
      pieceMoved = true;
      puzzleMatrix[row][cell - 1] = clickedElement;
    }

    // if we moved a piece, put the empty in the place of the element we just moved
    // and track it as a recent move
    if (pieceMoved) {
      puzzleMatrix[row][cell] = 0;
      this.state.lastMoves.unshift(clickedElement);
    }

    return puzzleMatrix;
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
    this.setState({
      dim: dim,
      puzzleMatrix: puzzleMatrix,
      solutionMatrix: solutionMatrix,
      lastMoves: [],
      isSolved: true
    });
  }

  // BUILD A SHUFFLED BOARD AND SET STATE
  shufflePuzzle(dim) {
    const minShuffle = dim;
    const maxShuffle = dim * 2;
    const steps = Math.floor(Math.random() * (maxShuffle - minShuffle + 1)) + minShuffle;
    const solutionMatrix = this.prepData(dim);
    let puzzleMatrix = this.prepData(dim);
    this.state.lastMoves = [];
    let solved;
    for (let vg = 0; vg < steps; vg++) {
      const next = this.findRandomNext(puzzleMatrix);
      puzzleMatrix = this.moveElement(puzzleMatrix, next.row, next.cell);
      solved = this.checkIfSolved(puzzleMatrix, this.state.solutionMatrix);
    }
    this.setState({
      dim: dim,
      puzzleMatrix: puzzleMatrix,
      solutionMatrix: solutionMatrix,
      isSolved: solved
    });
  }

  render() {
    const styles = require('./PuzzleBox.scss');

    // UI HANDLER TO MOVE A CLICKED TILE AND SET STATE
    const moveElementHandler = (ridx, cidx) => {
      let puzzleMatrix = this.state.puzzleMatrix;
      puzzleMatrix = this.moveElement(puzzleMatrix, ridx, cidx);
      const solved = this.checkIfSolved(puzzleMatrix, this.state.solutionMatrix);
      this.setState({
        puzzleMatrix: puzzleMatrix,
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
        <button className={styles.shuffleButton} onClick={this.resetPuzzle.bind(this, this.state.dim)}>Reset</button>
        {
          ( this.state.isSolved ) ?
          (<h3>Status: Solved</h3>) :
          (<h3>Status: Unsolved</h3>)
        }
        <table key={'table'} className={styles.puzzleBox}>
          <tbody key={'tbody'}>
            {
              this.state.puzzleMatrix.map(function puzzleRow(row, ridx) {
                return (
                  <tr key={'tr' + row}>{
                    row.map(function puzzleCell(cell, cidx) {
                      return (cell > 0)
                      ? (<td key={'td' + cell} className={styles.fullCell}
                            onClick={moveElementHandler.bind(this, ridx, cidx)}>
                              {cell}
                            </td>)
                      : (<td key={'td' + cell} className={styles.emptyCell}>&nbsp;</td>);
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
