import React, {Component} from 'react';
import Helmet from 'react-helmet';
import { PuzzleBox } from 'components';


export default class Puzzle extends Component {

  render() {
    return (
      <div className="container">
        <h1>Sliding Puzzle</h1>
        <Helmet title="Sliding Puzzle"/>
        <p>A sliding puzzle consists of a frame of numbered square tiles in random order with one tile missing. </p>
        <p>The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space.</p>
        <p>Check it out on github: <a href="https://github.com/andrewmontes87/react-sliding-puzzle" target="_blank">https://github.com/andrewmontes87/react-sliding-puzzle</a></p>
        <p><strong>How to play</strong></p>
        <ul>
          <li>Click a tile that is next to the empty space to slide it over.</li>
          <li>See previous board moves in the list below to help solve the puzzle.</li>
          <li>Change the dimensions of your puzzle for a harder challenge.</li>
          <li>Click "Shuffle" to create a random shuffled puzzle to solve.</li>
          <li>Click "Reset" to bring the puzzle back to a solved state.</li>
        </ul>
        <PuzzleBox />
      </div>
    );
  }
}
