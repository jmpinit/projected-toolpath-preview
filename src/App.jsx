import React, { useState } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import CameraCalibrator from './components/CameraCalibrator';
import MachineCalibrator from './components/MachineCalibrator';
import ProjectorCalibrator from './components/ProjectorCalibrator';
import ProjectedToolpath from './components/ProjectedToolpath';
import MemoryUsage from './components/MemoryUsage';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

function TabNavigator({ children }) {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  const renderTabs = () => children.map((child, index) => (
    <button
      type="button"
      key={index}
      disabled={index === selectedTabIndex}
      onClick={() => setSelectedTabIndex(index)}
    >
      {child.props.tabName}
    </button>
  ));

  const renderSelectedTabContent = () => React.Children
    .map(children, (child, index) => {
      if (index === selectedTabIndex) {
        return <div key={index}>{child}</div>;
      }

      return null;
    });

  return (
    <div>
      <div>{renderTabs()}</div>
      <div>{renderSelectedTabContent()}</div>
    </div>
  );
}

function Tab({ children }) {
  return children;
}

function App() {
  return (
    <AppContainer>
      <MemoryUsage />
      <TabNavigator>
        <Tab tabName="Camera Calibration"><CameraCalibrator /></Tab>
        <Tab tabName="Machine Calibration"><MachineCalibrator /></Tab>
        <Tab tabName="Projector Calibration"><ProjectorCalibrator /></Tab>
        <Tab tabName="Preview Toolpath"><ProjectedToolpath /></Tab>
      </TabNavigator>
    </AppContainer>
  );
}

function mapStateToProps(state) {
  return {
    appMode: state.app.mode,
  };
}

export default connect(mapStateToProps)(App);
