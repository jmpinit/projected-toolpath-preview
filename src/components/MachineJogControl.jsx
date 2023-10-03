import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';

const VertContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const HorizContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledButton = styled.button`
  flex: 1;
`;

function dispatchJog(dispatch, x, y) {
  dispatch({
    type: 'CNC_JOG',
    payload: {
      x,
      y,
    },
  });
}

function MachineJogControl({ machineConnected, dispatch }) {
  const disabled = !machineConnected;

  const gotoHome = useCallback(() => dispatch({
    type: 'CNC_MOVETO',
    payload: {
      x: 0,
      y: 0,
    },
  }), [dispatch]);

  useEffect(() => {
    let moveInterval;
    let firstMoveTimeout;
    let currentMoveKey;

    function handleKeydown(event) {
      if (!machineConnected) {
        return;
      }

      if (moveInterval) {
        // We're already moving
        return;
      }

      currentMoveKey = event.key;

      const delta = { x: 0, y: 0 };

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          delta.y = 1;
          break;
        case 'ArrowDown':
        case 's':
          delta.y = -1;
          break;
        case 'ArrowLeft':
        case 'a':
          delta.x = -1;
          break;
        case 'ArrowRight':
        case 'd':
          delta.x = 1;
          break;
        default:
          currentMoveKey = undefined;
          return;
      }

      // FIXME: don't hardcode this here, read it from the state
      const speed = 2000 / 60;
      const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
      const millisToMove = (dist / speed) * 1000;

      // Start moving continuously after a short delay
      // so that it's easier to hone in on a target with small movements
      firstMoveTimeout = setTimeout(() => {
        firstMoveTimeout = undefined;
        moveInterval = setInterval(() => dispatchJog(dispatch, delta.x, delta.y), millisToMove);
      }, 250);

      // Dispatch a first jog that is smaller to
      // - Act immediately
      // - Make it easier to hone in on a target
      dispatchJog(dispatch, delta.x / 4, delta.y / 4);
    }

    function handleKeyup(event) {
      console.log('keyup', event.key);

      if (currentMoveKey === undefined || event.key !== currentMoveKey) {
        return;
      }

      currentMoveKey = undefined;

      if (firstMoveTimeout !== undefined) {
        clearTimeout(firstMoveTimeout);
        firstMoveTimeout = undefined;
      }

      if (moveInterval !== undefined) {
        clearInterval(moveInterval);
        moveInterval = undefined;
      }
    }

    function handleUnload(event) {
      gotoHome();
      event.preventDefault();
      // eslint-disable-next-line no-param-reassign
      event.returnValue = '';
    }

    if (machineConnected) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('keyup', handleKeyup);
      window.addEventListener('beforeunload', handleUnload);

      return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('keyup', handleKeyup);
        window.removeEventListener('beforeunload', handleUnload);

        if (moveInterval) {
          clearInterval(moveInterval);
        }
      };
    }
  }, [machineConnected, dispatch]);

  const handleJogUp = useCallback(() => dispatchJog(dispatch, 0, 1), []);
  const handleJogDown = useCallback(() => dispatchJog(dispatch, 0, -1), []);
  const handleJogLeft = useCallback(() => dispatchJog(dispatch, -1, 0), []);
  const handleJogRight = useCallback(() => dispatchJog(dispatch, 1, 0), []);

  const handleConnect = useCallback(() => {
    dispatch({ type: 'CNC_CONNECT' });
  }, []);

  return (
    <VertContainer>
      <button type="button" onClick={handleJogUp} disabled={disabled}>Up</button>
      <HorizContainer>
        <StyledButton type="button" onClick={handleJogLeft} disabled={disabled}>Left</StyledButton>
        <StyledButton type="button" onClick={handleJogRight} disabled={disabled}>Right</StyledButton>
      </HorizContainer>
      <button type="button" onClick={handleJogDown} disabled={disabled}>Down</button>
      <button type="button" onClick={gotoHome} disabled={disabled}>Go Home</button>
      <button type="button" onClick={handleConnect} disabled={machineConnected}>Connect</button>
    </VertContainer>
  );
}

MachineJogControl.propTypes = {
  machineConnected: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    machineConnected: state.cnc.connected,
  };
}

export default connect(mapStateToProps)(MachineJogControl);
