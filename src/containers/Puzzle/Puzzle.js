import React, {Component} from 'react';
import Helmet from 'react-helmet';
import { PuzzleBox } from 'components';


export default class Puzzle extends Component {

  render() {
    return (
      <div className="container">
        <h1>15-Puzzle</h1>
        <Helmet title="15-Puzzle"/>
        <p>The 15-puzzle is a sliding puzzle that consists of a frame of numbered square tiles in random order with one tile missing. </p>
        <p>The object of the puzzle is to place the tiles in order by making sliding moves that use the empty space.</p>
        <PuzzleBox />
      </div>
    );
  }
}
