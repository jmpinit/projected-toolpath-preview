import React from 'react';
import ReactDOM from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';

import rootReducer from './reducers';
import createAxiDrawMiddleware from './middleware/axidraw-middleware';
import App from './App';
import createBroadcastMiddleware from './middleware/broadcast-middleware';

const store = createStore(
  rootReducer,
  applyMiddleware(
    createBroadcastMiddleware(),
    createAxiDrawMiddleware(),
  ),
);

const GlobalStyle = createGlobalStyle`
  html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  
  #root {
    height: 100%;
    width: 100%;
  }
`;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <GlobalStyle />
    <App />
  </Provider>
);
