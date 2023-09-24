import React from 'react';
import ReactDOM from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import App from './App';
import rootReducer from './reducers';

const store = createStore(rootReducer);

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
