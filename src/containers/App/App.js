import React, { Component, PropTypes } from 'react';
import { IndexLink } from 'react-router';
import Navbar from 'react-bootstrap/lib/Navbar';
import Helmet from 'react-helmet';
import config from '../../config';
import { asyncConnect } from 'redux-async-connect';
import ogImg from '../../../static/images/sliding_puzzle_og.png';


@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    return Promise.resolve();
  }
}])

export default class App extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const styles = require('./App.scss');

    config.app.head.meta = config.app.head.meta.map(( meta ) => {
      // since config.js doesnt have access to import, we will inject the image path here
      // after a replacement of the absolute url with
      if ( meta.property === 'og:image' || meta.property === 'twitter:image') {
        meta.content = config.domain + ogImg.replace(/.*dist/, '/dist');
      }
      return meta;
    });

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head}/>
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeStyle={{color: '#33e0ff'}}>
                <div className={styles.brand}/>
                <span>{config.app.title}</span>
              </IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle/>
          </Navbar.Header>
        </Navbar>
        <div className={styles.appContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
