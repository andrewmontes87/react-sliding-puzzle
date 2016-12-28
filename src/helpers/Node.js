//
// defining a node
function Node(value, state, emptyRow, emptyCol, depth) {
  // represents the f(s) value
  this.value = value;
  // state of the board as a two-dimensional array
  this.state = state;
  // column in which the empty tile is located
  this.emptyCol = emptyCol;
  // row in which the empty tile is located
  this.emptyRow = emptyRow;
  // the number of moves executed from the initial configuration
  // up to the configuration of this node, the g(s) value
  this.depth = depth;
  // string representation of the board in CSV format
  // for the goal configuration the string representation
  // would be “1,2,3,4,5,6,7,8,0,”
  this.strRepresentation = '';
  // stores every move in a string (“DLRU”)
  // this string represents the sequence of moves made from the
  // initial configuration up to the current node
  this.path = '';

  // build string representation of the state in CSV format
  for (let ix = 0; ix < state.length; ix++) {
    // assume the state is a square
    if (state[ix].length !== state.length) {
      alert('Number of rows differs from number of columns');
      return false;
    }

    for (let jx = 0; jx < state[ix].length; jx++) {
      this.strRepresentation += state[ix][jx] + ',';
    }
  }

  // size of the board
  this.size = this.state.length;
}

export default Node;
