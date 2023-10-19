import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import ControlPanel from './components/ControlPanel';
import CameraUI from './components/CameraUI';
import VideoContext from './components/VideoContext';
import ProjectionUI from './components/ProjectionUI';

const AppContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export default function App() {
  const [projecting, setProjecting] = useState(false);
  const videoRef = useRef(null);
  const projectionCanvasRef = useRef(null);

  useEffect(() => {
    const handleFullscreen = (event) => {
      if (event.key === 'f') {
        setProjecting((prev) => !prev);
        // projectionCanvasRef.current.requestFullscreen();
      }
    };

    window.addEventListener('keydown', handleFullscreen);

    return () => window.removeEventListener('keydown', handleFullscreen);
  }, [projecting, setProjecting, projectionCanvasRef]);

  return (
    <AppContainer>
      {projecting ? (
        <ProjectionUI ref={projectionCanvasRef} />
      ) : (
        <CameraUI ref={videoRef} />
      )}
      <VideoContext.Provider value={videoRef}>
        <ControlPanel />
      </VideoContext.Provider>
    </AppContainer>
  );
}
