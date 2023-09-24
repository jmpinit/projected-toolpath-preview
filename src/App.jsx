import React, { useCallback } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { MODE_UI, MODE_PROJECTION } from './reducers/app';
import ProjectionUI from './components/ProjectionUI';
import CalibrationUI from './components/CalibrationUI';

const AppContainer = styled.div`
  height: 100%;
  width: 100%;
  background-color: #000;
  color: #fff;
  display: flex;
`;

function App({ appMode, dispatch }) {
  const switchMode = useCallback(() => {
    if (appMode === MODE_PROJECTION) {
      dispatch({ type: 'SET_UI_MODE' });
    } else if (appMode === MODE_UI) {
      dispatch({ type: 'SET_PROJECTION_MODE' });
    }
  }, [appMode]);

  return (
    <AppContainer>
      {appMode === MODE_UI && (
        <CalibrationUI />
      )}
      {appMode === MODE_PROJECTION && (
        <ProjectionUI />
      )}
    </AppContainer>
  );
}

function mapStateToProps(state) {
  return {
    appMode: state.app.mode,
  };
}

export default connect(mapStateToProps)(App);
