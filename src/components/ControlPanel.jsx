import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import MachineInterfaceType from './MachineInterfaceType';
import MachineJogControl from './MachineJogControl';
import PositionStatus from './PositionStatus';
import JobUploadButton from './JobUploadButton';
import MappingControls from './MappingControls';
import MemoryUsage from './MemoryUsage';

const ControlContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
`;

function ControlPanel({ interfaceType, dispatch }) {
  const handleInterfaceTypeChange = useCallback(
    (newType) => dispatch({
      type: 'CNC_SET_INTERFACE_TYPE',
      payload: newType,
    }),
    [dispatch],
  );

  return (
    <ControlContainer>
      <MachineInterfaceType onChange={handleInterfaceTypeChange} />
      {interfaceType !== 'manual' && (
        <MachineJogControl />
      )}
      <PositionStatus />
      <JobUploadButton />
      <MappingControls />
      <MemoryUsage />
    </ControlContainer>
  );
}

ControlPanel.propTypes = {
  interfaceType: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    interfaceType: state.cnc.interfaceType,
  };
}

export default connect(mapStateToProps)(ControlPanel);
