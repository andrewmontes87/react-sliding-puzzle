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
  findNext(puzzleMatrix) {
    const dim = puzzleMatrix.length;
    const lastMove = this.state.lastMoves[0];
    const possibleMoves = [];

    // find the row, column indexes of the empty space
    const empty = this.findEmpty(puzzleMatrix);
    const ri = empty.row;
    const ci = empty.cell;

    // row, column indexes of next moves in four direcionts
    const topri = ri - 1 >= 0 ? ri - 1 : null;
    const topci = ci;
    const rightri = ri;
    const rightci = ci + 1 < dim ? ci + 1 : null;
    const bottomri = ri + 1 < dim ? ri + 1 : null;
    const bottomci = ci;
    const leftri = ri;
    const leftci = ci - 1 >= 0 ? ci - 1 : null;

    // check four directions for possible moves
    if (topri !== null && topci !== null) {
      possibleMoves.push({
        row: topri,
        cell: topci
      });
    }
    if (rightri !== null && rightci !== null) {
      possibleMoves.push({
        row: rightri,
        cell: rightci
      });
    }
    if (bottomri !== null && bottomci !== null) {
      possibleMoves.push({
        row: bottomri,
        cell: bottomci
      });
    }
    if (leftri !== null && leftci !== null) {
      possibleMoves.push({
        row: leftri,
        cell: leftci
      });
    }

    // choose a random move
    let randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    // don't repeat the last move
    while (puzzleMatrix[randomMove.row][randomMove.cell] === lastMove) {
      randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    return randomMove;
  }

  // MOVE AN ELEMENT TO THE EMPTY SPACE IN A PUZZLE MATRIX
  moveElement(puzzleMatrix, row, cell) {
    const dim = puzzleMatrix.length;
    const movingElement = puzzleMatrix[row][cell];

    // if already the empty cell, return untouched puzzleMatrix
    if (puzzleMatrix[row][cell] === 0) return puzzleMatrix;

    // if not, check available nearby cells
    // first set limits based on where the piece is on the board
    const top = row > 0 ? puzzleMatrix[row - 1][cell] : -1;
    const right = cell < dim - 1 ? puzzleMatrix[row][cell + 1] : -1;
    const bottom = row < dim - 1 ? puzzleMatrix[row + 1][cell] : -1;
    const left = cell > 0 ? puzzleMatrix[row][cell - 1] : -1;

    // if any of the nearby cells are the empty, swap places
    let tmp;
    if (!top) {
      tmp = puzzleMatrix[row - 1][cell];
      puzzleMatrix[row - 1][cell] = movingElement;
    } else if (!right) {
      tmp = puzzleMatrix[row][cell + 1];
      puzzleMatrix[row][cell + 1] = movingElement;
    } else if (!bottom) {
      tmp = puzzleMatrix[row + 1][cell];
      puzzleMatrix[row + 1][cell] = movingElement;
    } else if (!left) {
      tmp = puzzleMatrix[row][cell - 1];
      puzzleMatrix[row][cell - 1] = movingElement;
    }

    puzzleMatrix[row][cell] = tmp;
    this.state.lastMoves.unshift(movingElement);

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
      const next = this.findNext(puzzleMatrix);
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
