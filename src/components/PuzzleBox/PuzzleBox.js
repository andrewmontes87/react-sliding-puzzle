import React, {Component} from 'react';

export default class PuzzleBox extends Component {

  constructor(props) {
    super(props);
    this.DIM = 4;
    this.MINSHUFFLE = 4;
    this.MAXSHUFFLE = 8;
    const startData = this.prepData();
    this.state = {
      refData: startData,
      data: startData,
      lastMoves: []
    };
  }

  prepData() {
    const data = [];
    // for each row...
    for (let idx = 0; idx < this.DIM; idx++) {
      // push a new empty array
      data.push([]);
      // for each cell...
      for (let nidx = 1 + (idx * this.DIM); nidx <= this.DIM + (idx * this.DIM); nidx++) {
        // push a new number
        if (nidx) {
          data[idx].push(nidx);
        }
      }
    }
    data[this.DIM - 1][this.DIM - 1] = 0;
    return data;
  }

  checkIfSolved(data) {
    return JSON.stringify(data) === JSON.stringify(this.state.refData);
  }

  shufflePuzzle() {
    let resetData = this.prepData();
    this.state.lastMoves = [];
    console.log('Shuffle!');
    const steps = Math.floor(Math.random() * (this.MAXSHUFFLE - this.MINSHUFFLE + 1)) + this.MINSHUFFLE;
    for (let vg = 0; vg < steps; vg++) {
      const empty = this.findEmpty(resetData);
      const next = this.findNext(resetData, empty);
      resetData = this.moveElement(resetData, next.row, next.cell);
    }
    this.setState({ data: resetData });
  }

  resetPuzzle() {
    const resetData = this.prepData();
    this.setState({
      data: resetData,
      lastMoves: []
    });
  }

  findEmpty(data) {
    for (let ir = 0; ir < this.DIM; ir++) {
      for (let ic = 0; ic < this.DIM; ic++) {
        if (data[ir][ic] === 0) {
          return {
            row: ir,
            cell: ic
          };
        }
      }
    }
    return null;
  }

  findNext(data, empty) {
    const ri = empty.row;
    const ci = empty.cell;
    const nextOptions = [];
    const topri = ri - 1 >= 0 ? ri - 1 : null;
    const topci = ci;
    if (topri !== null && topci !== null) {
      nextOptions.push({
        row: topri,
        cell: topci
      });
    }
    const rightri = ri;
    const rightci = ci + 1 < this.DIM ? ci + 1 : null;
    if (rightri !== null && rightci !== null) {
      nextOptions.push({
        row: rightri,
        cell: rightci
      });
    }
    const bottomri = ri + 1 < this.DIM ? ri + 1 : null;
    const bottomci = ci;
    if (bottomri !== null && bottomci !== null) {
      nextOptions.push({
        row: bottomri,
        cell: bottomci
      });
    }
    const leftri = ri;
    const leftci = ci - 1 >= 0 ? ci - 1 : null;
    if (leftri !== null && leftci !== null) {
      nextOptions.push({
        row: leftri,
        cell: leftci
      });
    }
    let randOption = nextOptions[Math.floor(Math.random() * nextOptions.length)];
    while (data[randOption.row][randOption.cell] === this.state.lastMoves[0]) {
      console.log('trying again');
      randOption = nextOptions[Math.floor(Math.random() * nextOptions.length)];
    }
    console.log(randOption);
    return randOption;
  }

  moveElement(matrix, row, cell) {
    const data = matrix;
    const refCell = data[row][cell];
    // if already the emnpty cell, return untouched data
    if (data[row][cell] === 0) return data;
    // if not, check available nearby cells
    const top = row > 0 ? data[row - 1][cell] : -1;
    const right = cell < this.DIM - 1 ? data[row][cell + 1] : -1;
    const bottom = row < this.DIM - 1 ? data[row + 1][cell] : -1;
    const left = cell > 0 ? data[row][cell - 1] : -1;
    // if any of the nearby cells are the empty, swap places
    let move = '';
    if (top === 0) {
      const tmp = data[row - 1][cell];
      data[row - 1][cell] = data[row][cell];
      data[row][cell] = tmp;
      move = 'top';
    } else if (right === 0) {
      const tmp = data[row][cell + 1];
      data[row][cell + 1] = data[row][cell];
      data[row][cell] = tmp;
      move = 'right';
    } else if (bottom === 0) {
      const tmp = data[row + 1][cell];
      data[row + 1][cell] = data[row][cell];
      data[row][cell] = tmp;
      move = 'bottom';
    } else if (left === 0) {
      const tmp = data[row][cell - 1];
      data[row][cell - 1] = data[row][cell];
      data[row][cell] = tmp;
      move = 'left';
    }
    console.log(refCell, 'tile moves', move, 'from', row, cell);
    this.state.lastMoves.unshift(refCell);
    return data;
  }

  render() {
    const styles = require('./PuzzleBox.scss');
    const moveElementHandler = (ridx, cidx) => {
      let matrix = this.state.data;
      matrix = this.moveElement(matrix, ridx, cidx);
      this.setState({ data: matrix });
    };
    return (<div>
        <button className={styles.shuffleButton} onClick={this.shufflePuzzle.bind(this)}>Shuffle</button>
        <button className={styles.shuffleButton} onClick={this.resetPuzzle.bind(this)}>Reset</button>
        {
          ( this.checkIfSolved(this.state.data) ) ?
          (<h3>Status: Solved</h3>) :
          (<h3>Status: Unsolved</h3>)
        }
        <table key={'table'} className={styles.puzzleBox}>
          <tbody key={'tbody'}>
            {
              this.state.data.map(function puzzleRow(row, ridx) {
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
