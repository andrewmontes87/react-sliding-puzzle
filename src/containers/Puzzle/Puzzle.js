import React, {Component} from 'react';
import Helmet from 'react-helmet';
import { PuzzleBox } from 'components';


export default class Puzzle extends Component {

  render() {
    return (
      <div className="container">
        <h1>Puzzle</h1>
        <Helmet title="Puzzle!"/>
        Have a wonderful day!
        <PuzzleBox />
      </div>
    );
  }
}
