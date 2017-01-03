import React from 'react';
import {IndexRoute, Route} from 'react-router';
import {
    App,
    Puzzle,
    NotFound,
  } from 'containers';

export default (store) => {
  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={Puzzle}/>

      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
