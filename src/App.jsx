import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import CameraCalibrator from './components/CameraCalibrator';
import MachineCalibrator from './components/MachineCalibrator';

const AppContainer = styled.div`
  display: flex;
`;

function App() {
  return (
    <AppContainer>
      <MachineCalibrator />
      {/*<CameraCalibrator />*/}
    </AppContainer>
  );
}

function mapStateToProps(state) {
  return {
    appMode: state.app.mode,
  };
}

export default connect(mapStateToProps)(App);
