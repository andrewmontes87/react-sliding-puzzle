import React, {Component} from 'react';
import Helmet from 'react-helmet';
// import { PuzzleBox } from 'components';
import { connect } from 'react-redux';
import PuzzleFunctions from '../../helpers/PuzzleFunctions';
import * as reduxActions from 'redux/modules/puzzleSolver';


@connect(
  state => ({
    result: state.puzzleSolve.result,
    searching: state.puzzleSolve.loading,
    searched: state.puzzleSolve.loaded,
    error: state.puzzleSolve.error
  }),
  reduxActions)
export default class Puzzle extends Component {

  constructor(props) {
    super(props);
    const initDim = 3;
    const initSolvedPuzzle = PuzzleFunctions.prepData(initDim);
    this.state = {
      dim: initDim,
      solutionMatrix: initSolvedPuzzle,
      puzzleMatrix: JSON.parse(JSON.stringify(initSolvedPuzzle)),
      emptyPos: [initDim - 1, initDim - 1],
      isSolved: true,
      lastMoves: [],
      solutionObj: {},
      isBeingSolved: false,
      searched: false,
      searching: false,
      error: null
    };
  }

  // STUBS
  componentWillMount() {
  }

  componentDidMount() {
  }

  // if we reveive props, it's a new puzzle solution
  // attach it to state.solutionObj
  componentWillReceiveProps(props) {
    if (props.result) {
      this.setState({
        isBeingSolved: true,
        solutionObj: props.result,
        searched: props.searched,
        searching: props.searching,
        error: props.error,
      });
      this.solvePuzzle(props.result);
    } else if (props.error) {
      this.setState({
        isBeingSolved: false,
        solutionObj: {},
        searched: props.searched,
        searching: props.searching,
        error: props.error,
      });
    } else {
      this.setState({
        searched: props.searched,
        searching: props.searching,
        error: props.error,
      });
    }
  }


  //
  // API HANDLER
  // click handler for calling API with puzzle string
  getPuzzleSolution() {
    // only dim === 3 for now
    if (this.state.dim === 3 || this.state.dim === 4) {
      // upddate state so UI handlers are disabled
      this.setState({ isBeingSolved: true });
      // // format puzzle as string to just values
      const puzzleString = PuzzleFunctions.convertMatrixToString(this.state.puzzleMatrix);
      // call for a puzzle solution
      this.props.puzzleSolution(puzzleString);
    }
  }


  //
  // ASTAR HANDLER
  // click handler for AStar solution algorithm
  //
  solvePuzzle(solutionObj) {
    let puzzleMatrix = this.state.puzzleMatrix;
    let empty = this.state.emptyPos;
    const solutionMatrix = this.state.solutionMatrix;

    const solutionPath = solutionObj.solution.split('');

    if (!solutionPath.length) {
      this.setState({ isBeingSolved: false });
    } else {
      const interval = setInterval( () => {
        const result = PuzzleFunctions.moveElementByDirectionString(solutionPath.shift(), puzzleMatrix, empty);
        puzzleMatrix = result[0];
        empty = result[1];
        const solved = PuzzleFunctions.checkIfSolved(puzzleMatrix, solutionMatrix);
        this.setState({
          puzzleMatrix: puzzleMatrix,
          emptyPos: empty,
          isSolved: solved
        });
        if (!solutionPath.length) {
          clearInterval(interval);
          this.setState({ isBeingSolved: false });
        }
      }, 1000);
    }
  }


  //
  // STATE SETTER UI HANDLERS
  //

  // BUILD A SOLVED BOARD AND SET STATE
  resetPuzzle(dim) {
    const puzzleMatrix = PuzzleFunctions.prepData(dim);
    const solutionMatrix = PuzzleFunctions.prepData(dim);
    const emptyPos = [dim - 1, dim - 1];
    this.setState({
      dim: dim,
      puzzleMatrix: puzzleMatrix,
      solutionMatrix: solutionMatrix,
      emptyPos: emptyPos,
      lastMoves: [],
      isSolved: true,
      solutionObj: {},
      isBeingSolved: false,
      searched: false,
      searching: false,
      error: null
    });
  }

  //
  // the mighty render function
  render() {
    const styles = require('./Puzzle.scss');

    // UI HANDLER TO MOVE A CLICKED TILE AND SET STATE
    const moveElementHandler = (ridx, cidx) => {
      if (!this.state.isBeingSolved) {
        const solutionMatrix = this.state.solutionMatrix;
        let puzzleMatrix = this.state.puzzleMatrix;
        let empty = this.state.emptyPos;
        let move;
        const moveResults = PuzzleFunctions.moveElement(puzzleMatrix, ridx, cidx, empty);
        puzzleMatrix = moveResults[0];
        empty = moveResults[1];
        move = moveResults[2];
        const lastMovesClone = JSON.parse(JSON.stringify(this.state.lastMoves));
        if (move) {
          lastMovesClone.unshift(move);
        }
        const solved = PuzzleFunctions.checkIfSolved(puzzleMatrix, solutionMatrix);
        this.setState({
          puzzleMatrix: puzzleMatrix,
          emptyPos: empty,
          isSolved: solved,
          lastMoves: lastMovesClone,
          solutionObj: {},
          searched: false,
          searching: false,
          error: false,
        });
      }
    };

    const shufflePuzzleStateHandler = (dim) => {
      const results = PuzzleFunctions.createShuffledPuzzleState(dim);
      this.setState({
        dim: results.dim,
        solutionMatrix: results.solutionMatrix,
        puzzleMatrix: results.puzzleMatrix,
        emptyPos: results.emptyPos,
        isSolved: results.solved,
        lastMoves: results.lastMoves,
        solutionObj: {},
        isBeingSolved: false,
        searched: false,
        searching: false,
        error: null
      });
    };

    // const debugStateHandler = () => {
    //   return JSON.stringify(this.state);
    // };

    // DROPDOWN FORM HANDLERS
    const handleNChange = (event) => {
      const dim = parseInt(event.target.value, 10);
      shufflePuzzleStateHandler(dim);
    };

    const handleSubmit = (event) => {
      event.preventDefault();
    };

    const apiStatusString = () => {
      let result = true;

      if (this.state.dim > 4) {
        result = (<span>Sorry, only available for 3x3 and 4x4 puzzles</span>);
      } else if (this.state.searching) {
        result = (<span>Searching...</span>);
      } else if (this.state.searched && !this.state.isSolved) {
        result = (<span>Displaying solution</span>);
      } else if (!this.state.searched && this.state.isSolved) {
        result = (<span>Solved</span>);
      } else if (this.state.searched && this.state.isSolved) {
        result = (<span>Solved</span>);
      } else {
        result = (<span>Not attempted</span>);
      }

      return result;
    };

    const dimDisabled = () => {
      const dim = this.state.dim;
      const allowedDim = (dim === 3 || dim === 4) ? true : false;
      return this.state.isBeingSolved || !allowedDim;
    };

    return (
      <div className="container">
        <h1>Sliding N-Puzzle</h1>
        <Helmet title="Sliding N-Puzzle"/>
        <p>A sliding puzzle consists of a frame of numbered square tiles in random order with one tile missing. The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space. This project is built with React + Redux.</p>
        <p></p>
        <p>Github: <a href="https://github.com/andrewmontes87/react-sliding-puzzle" target="_blank">https://github.com/andrewmontes87/react-sliding-puzzle</a></p>
        <p>Puzzle solutions are found using the A* algorithm, using Manhattan distance for a heuristic. Solutions are provided by a Node.js webservice.</p>
        <p>Github: <a href="https://github.com/andrewmontes87/node-sliding-puzzle" target="_blank">https://github.com/andrewmontes87/node-sliding-puzzle</a></p>
        <p>Please note, this is all running on free Heroku servers, so it may be slow to get started.</p>
        <p><strong>How to play</strong></p>
        <ul>
          <li>Click a tile that is next to the empty space to slide it over.</li>
          <li>Change the dimensions of your puzzle for a harder challenge.</li>
          <li>Click "Shuffle" to create a random shuffled puzzle to solve.</li>
          <li>Click "Reset" to bring the puzzle back to a solved state.</li>
          <li>Click "Solve" to have the puzzle solved for you, step by step.</li>
        </ul>
        <div>
          <form onSubmit={handleSubmit.bind(this)}>
            <label>
              Pick the size of your puzzle:&nbsp;
              <select disabled={this.state.isBeingSolved} value={parseInt(this.state.dim, 10)} onChange={handleNChange.bind(this)}>
                <option value="3">3 x 3</option>
                <option value="4">4 x 4</option>
                <option value="5">5 x 5</option>
              </select>
            </label>
          </form>
          <button className={styles.shuffleButton} disabled={this.state.isBeingSolved} onClick={shufflePuzzleStateHandler.bind(this, this.state.dim)}>Shuffle</button>
          <button className={styles.shuffleButton} disabled={this.state.isBeingSolved} onClick={this.resetPuzzle.bind(this, this.state.dim)}>Reset</button>
          <button className={styles.shuffleButton} disabled={ dimDisabled() } onClick={this.getPuzzleSolution.bind(this)}>Solve</button>
          <h4>A* solution status: { apiStatusString() }</h4>
          {(this.state.error) ? (<h4>Error: {this.state.error}</h4>) : null}
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
        </div>
      </div>
    );
  }
}
