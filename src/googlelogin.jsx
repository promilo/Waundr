import React from 'react';
import ReactDOM from 'react-dom';
// import FontAwesome from 'react-fontawesome';
import GoogleLogin from '../src/index';
// import GoogleLogin from '../dist/google-login';

const success = (response) => {
  console.log(response);
};

const error = (response) => {
  console.error(response);
};

const loading = () => {
  console.log('loading');
};

ReactDOM.render(
  <div>
    
  </div>,
  document.getElementById('google-login')
);
