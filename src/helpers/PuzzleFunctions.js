//
// PUZZLE FUNCTIONS
//

// puzzle pieces take the shape:
// [value, [rowPosition, columnPosition]]
// e.g. the first piece is [1, [0, 0]]
// e.g. the sixth piece is [6, [1, 2]]

function prepData(dim) {
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
function checkIfSolved(puzzleMatrix, solutionMatrix) {
  return JSON.stringify(puzzleMatrix) === JSON.stringify(solutionMatrix);
}

// MOVE AN ELEMENT TO THE EMPTY SPACE IN A PUZZLE MATRIX
function moveElement(puzzleMatrix, row, cell, empty) {
  const dim = puzzleMatrix.length;
  const clickedElement = puzzleMatrix[row][cell];
  let emptyPos = empty;
  let move = null;

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
    // move is the clicked element's value
    move = clickedElement[0];
  }

  return [puzzleMatrix, emptyPos, move];
}

// FIND A RANDOM NEXT PIECE TO SLIDE TO THE EMPTY SPACE
function findRandomNext(puzzleMatrix, empty, lastMove) {
  const dim = puzzleMatrix.length;
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

// BUILD A SHUFFLED BOARD AND RETURN A STATE OBJ
function createShuffledPuzzleState(dim) {
  const minShuffle = dim;
  const maxShuffle = dim * 10;
  const steps = Math.floor(Math.random() * (maxShuffle - minShuffle + 1)) + minShuffle;
  const solutionMatrix = prepData(dim);
  let puzzleMatrix = prepData(dim);
  let empty = [dim - 1, dim - 1];
  // accessing state?
  const lastMoves = [];
  let lastMove;
  let solved;
  for (let vg = 0; vg < steps; vg++) {
    const next = findRandomNext(puzzleMatrix, empty, lastMove);
    const moveResults = moveElement(puzzleMatrix, next[0], next[1], empty);
    puzzleMatrix = moveResults[0];
    empty = moveResults[1];
    lastMove = moveResults[2];
    lastMoves.unshift(lastMove);
    solved = checkIfSolved(puzzleMatrix, solutionMatrix);
  }
  return {
    dim: dim,
    puzzleMatrix: puzzleMatrix,
    solutionMatrix: solutionMatrix,
    emptyPos: empty,
    isSolved: solved,
    lastMoves: lastMoves
  };
}

function moveElementByDirectionString(direction, puzMatrix, emp) {
  let puzzleMatrix = puzMatrix;
  let empty = emp;
  let next;
  let move;

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

  const result = moveElement(puzzleMatrix, next[0], next[1], empty);
  puzzleMatrix = result[0];
  empty = result[1];
  move = result[2];

  return [puzzleMatrix, empty, move];
}

function convertMatrixToString(puzzleMatrix) {
  const puzzleBoard = puzzleMatrix.map( (row) => {
    return row.map( (cell) => {
      return cell[0];
    });
  });
  // make 2d array flat
  const puzzleFlat = puzzleBoard.reduce( (ax, bx) => {
    return ax.concat(bx);
  });
  // convert to string for api
  const puzzleString = puzzleFlat.toString();
  return puzzleString;
}

export default {
  prepData: prepData,
  checkIfSolved: checkIfSolved,
  moveElement: moveElement,
  createShuffledPuzzleState: createShuffledPuzzleState,
  moveElementByDirectionString: moveElementByDirectionString,
  convertMatrixToString: convertMatrixToString,
};
