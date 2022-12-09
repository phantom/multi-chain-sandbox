import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

// workaround for @solana/web3.js
import * as buffer from 'buffer';
window.Buffer = buffer.Buffer;

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
