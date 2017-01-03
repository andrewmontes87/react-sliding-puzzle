// import config from 'config';
// import Promise from 'bluebird';

const PUZZLE_SOLUTION = 'puzzle_solution';
const PUZZLE_SOLUTION_FAIL = 'puzzle_solution/fail';
const PUZZLE_SOLUTION_SUCCESS = 'puzzle_solution/success';


const initialState = {};


function baseReducer(state, action, actionTypes) {
  switch (action.type) {
    case actionTypes[0]:
      return {
        ...state,
        loading: true,
        loaded: false,
        result: null,
        error: null
      };
    case actionTypes[1]:
      return {
        ...state,
        loading: false,
        loaded: true,
        result: action.result,
        error: null
      };
    case actionTypes[2]:
      return {
        ...state,
        loading: false,
        loaded: false,
        result: null,
        error: action.error
      };
    default:
      return state;
  }
}


export function puzzleSolutionReducer(state = initialState, action = {}) {
  return baseReducer(state, action, [PUZZLE_SOLUTION, PUZZLE_SOLUTION_SUCCESS, PUZZLE_SOLUTION_FAIL]);
}


export function puzzleSolution(puzzleString) {
  return {
    types: [PUZZLE_SOLUTION, PUZZLE_SOLUTION_SUCCESS, PUZZLE_SOLUTION_FAIL],
    promise: (client) => client.get('/puzzle', {
      params: {
        'p': puzzleString
      }
    })
  };
}

