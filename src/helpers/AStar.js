import Node from './Node';
import HashSet from '../utils/hashset';
import PriorityQueue from '../utils/priority-queue';

// an implementation of the AStar algorithm
// courtesy of Arnaldo Perez Castano
// https://www.smashingmagazine.com/2016/02/javascript-ai-html-sliding-tiles-puzzle/


//
// array helper functions
function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

function contains(arr, input) {
  for (let ix = 0; ix < arr.length; ix++) {
    if (arr[ix] === input) {
      return true;
    }
  }
  return false;
}

function AStar(initial, goal, empty) {
  // the expansion translates into moving the empty tile in all possible directions,
  // hence generating new nodes that will be queued into the queue
  this.expandNode = (node) => {
    let temp = '';
    let newState = '';
    const col = node.emptyCol;
    const row = node.emptyRow;
    let newNode = '';

    // console.log(node);

    // Up
    // each block defines a possible direction around the empty space
    // first we check to see if the move is possible
    if (row > 0) {
      // if the move is possible, create a newState by cloning the current state
      newState = clone(node.state);
      // swap the empty tile with the corresponding element, create a newNode
      temp = newState[row - 1][col];
      newState[row - 1][col] = this.empty;
      newState[row][col] = temp;
      newNode = new Node(0, newState, row - 1, col, node.depth + 1);
      // if the node’s state is not in the visited hashset
      if (!contains(this.visited, newNode.strRepresentation)) {
        // calculate the value of the node (f = g + h)
        newNode.value = newNode.depth + this.heuristic(newNode);
        // amd add the corresponding direction to the path variable
        newNode.path = node.path + 'U';
        // queue it
        this.queue.queue(newNode);
        // and add it to the visited hashset
        this.visited.add(newNode.strRepresentation);
      }
    }

    // Down
    if (row < node.size - 1) {
      newState = clone(node.state);
      temp = newState[row + 1][col];
      newState[row + 1][col] = this.empty;
      newState[row][col] = temp;
      newNode = new Node(0, newState, row + 1, col, node.depth + 1);
      if (!contains(this.visited, newNode.strRepresentation)) {
        newNode.value = newNode.depth + this.heuristic(newNode);
        newNode.path = node.path + 'D';
        this.queue.queue(newNode);
        this.visited.add(newNode.strRepresentation);
      }
    }

    // Left
    if (col > 0) {
      newState = clone(node.state);
      temp = newState[row][col - 1];
      newState[row][col - 1] = this.empty;
      newState[row][col] = temp;
      newNode = new Node(0, newState, row, col - 1, node.depth + 1);
      if (!contains(this.visited, newNode.strRepresentation)) {
        newNode.value = newNode.depth + this.heuristic(newNode);
        newNode.path = node.path + 'L';
        this.queue.queue(newNode);
        this.visited.add(newNode.strRepresentation);
      }
    }

    // Right
    if (col < node.size - 1) {
      newState = clone(node.state);
      temp = newState[row][col + 1];
      newState[row][col + 1] = this.empty;
      newState[row][col] = temp;
      newNode = new Node(0, newState, row, col + 1, node.depth + 1);
      if (!contains(this.visited, newNode.strRepresentation)) {
        newNode.value = newNode.depth + this.heuristic(newNode);
        newNode.path = node.path + 'R';
        this.queue.queue(newNode);
        this.visited.add(newNode.strRepresentation);
      }
    }
  };

  // the heuristic is an essential component of the search
  // its cleverness can drastically reduce the time complexity of the algorithm
  this.heuristic = (node) => {
    return this.manhattanDistance(node) + this.manhattanDistance(node);
  };

  // the misplaced tiles heuristic, probably the simplest, most common heuristic for this puzzle
  // the misplaced tiles heuristic returns the number of tiles that are misplaced;
  // that is, in an incorrect position when compared to the goal configuration
  this.misplacedTiles = (node) => {
    let result = 0;
    for (let ix = 0; ix < node.state.length; ix++) {
      for (let jx = 0; jx < node.state[ix].length; jx++) {
        if (node.state[ix][jx] !== this.goal.state[ix][jx] && node.state[ix][jx] !== this.empty) {
          result++;
        }
      }
    }
    return result;
  };

  // the Manhattan distance (or block distance):
  // the sum of the absolute difference of their corresponding coordinates
  // MD = |x1−x2| + |y1−y2|
  // considering points A=(x1, y1) and B=(x2, y2)
  this.manhattanDistance = (node) => {
    let result = 0;
    for (let ix = 0; ix < node.state.length; ix++) {
      for (let jx = 0; jx < node.state[ix].length; jx++) {
        const elem = node.state[ix][jx];
        let found = false;
        for (let hx = 0; hx < this.goal.state.length; hx++) {
          for (let kx = 0; kx < this.goal.state[hx].length; kx++) {
            if (this.goal.state[hx][kx] === elem) {
              result += Math.abs(hx - ix) + Math.abs(jx - kx);
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }
    }
    return result;
  };

  // the Manhattan distance heuristic improves the time complexity of the algorithm
  // but there are some necessary moves that are being missed
  // the linear conflict heuristic provides information on these necessary moves
  // two tiles tj and tk are said to be in a linear conflict if:
  // - tj and tk are in the same line;
  // - the goal positions of tj and tk are both in that line;
  // - tj is to the right of tk;
  // - and the goal position of tj is to the left of the goal position of tk.
  this.linearConflicts = (node) => {
    let result = 0;
    const state = node.state;
    // row conflicts
    for (let ix = 0; ix < state.length; ix++) {
      result += this.findConflicts(state, ix, 1);
    }
    // column conflicts
    for (let ix = 0; ix < state[0].length; ix++) {
      result += this.findConflicts(state, ix, 0);
    }
    return result;
  };


  this.findConflicts = (state, ix, dimension) => {
    let result = 0;
    const tilesRelated = new Array();
    // loop foreach pair of elements in the row/column
    for (let hx = 0; hx < state.length - 1 && !contains(tilesRelated, hx); hx++) {
      for (let kx = hx + 1; kx < state.length && !contains(tilesRelated, hx); kx++) {
        const moves = dimension === 1
            ? this.inConflict(ix, state[ix][hx], state[ix][kx], hx, kx, dimension)
            : this.inConflict(ix, state[hx][ix], state[kx][ix], hx, kx, dimension);
        if (moves === 0) {
          continue;
        }
        result += 2;
        tilesRelated.push([hx, kx]);
        break;
      }
    }
    return result;
  };

  this.inConflict = (index, ax, bx, indexA, indexB, dimension) => {
    let indexGoalA = -1;
    let indexGoalB = -1;

    for (let cx = 0; cx < this.goal.state.length; cx++) {
      if (dimension === 1 && this.goal.state[index][cx] === ax) {
        indexGoalA = cx;
      } else if (dimension === 1 && this.goal.state[index][cx] === bx) {
        indexGoalB = cx;
      } else if (dimension === 0 && this.goal.state[cx][index] === ax) {
        indexGoalA = cx;
      } else if (dimension === 0 && this.goal.state[cx][index] === bx) {
        indexGoalB = cx;
      }
    }

    return (indexGoalA >= 0 && indexGoalB >= 0) &&
           ((indexA < indexB && indexGoalA > indexGoalB) ||
            (indexA > indexB && indexGoalA < indexGoalB))
              ? 2
              : 0;
  };

  //
  // init
  this.initial = initial;
  this.goal = goal;
  this.empty = empty;
  // for the priority queue, we define a comparison function that
  // we’ll need to sort the elements or nodes in ascending order
  this.queue = new PriorityQueue({ comparator: (ax, bx) => {
    if (ax.value > bx.value) {
      return 1;
    }
    if (ax.value < bx.value) {
      return -1;
    }
    return 0;
  }});
  this.queue.queue(initial);
  // the visited HashSet will store the strRepresentation of our
  // visited configurations, this way we avoid cycles
  this.visited = new HashSet();

  // add current state to visited list
  this.visited.add(this.initial.strRepresentation);
  // loop ends when the priority queue is empty
  while (this.queue.length > 0) {
    // current holds the node contained in the queue with minimum value
    const current = this.queue.dequeue();
    // if node’s state matches goal state then we have completed the task
    if (current.strRepresentation === this.goal.strRepresentation) {
      return current;
    }
    // otherwise expand the current node
    this.expandNode(current);
  }
}

export default AStar;
