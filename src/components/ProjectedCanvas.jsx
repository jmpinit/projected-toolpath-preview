import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/* eslint-disable no-param-reassign */
function resizeCanvas(canvas) {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

export default function ProjectedCanvas({ onFullscreen, onRender }) {
  const canvasRef = useRef();

  const requestFullscreen = useCallback(() => {
    canvasRef.current.requestFullscreen();
  }, []);

  const resizeAndRender = useCallback(() => {
    resizeCanvas(canvasRef.current);
    console.log(`Projected canvas size is ${canvasRef.current.width}x${canvasRef.current.height}`);
    onRender(canvasRef.current);
  }, [canvasRef, onRender]);

  // Resize canvas width and height when element size changes
  useEffect(() => {
    const canvas = canvasRef.current;

    function handleFullscreen() {
      if (document.fullscreenElement) {
        resizeAndRender();
        onFullscreen();
      }
    }

    canvas.addEventListener('fullscreenchange', handleFullscreen);
    return () => canvas.removeEventListener('fullscreenchange', handleFullscreen);
  }, [canvasRef]);

  useEffect(() => {
    const observer = new ResizeObserver(resizeAndRender);
    observer.observe(canvasRef.current);
    resizeAndRender(); // Render for the first time

    return () => observer.disconnect();
  }, [canvasRef, resizeAndRender]);

  return (
    <canvas ref={canvasRef} onClick={requestFullscreen} width={1280} height={720} />
  );
}

ProjectedCanvas.propTypes = {
  onFullscreen: PropTypes.func,
  onRender: PropTypes.func,
};

ProjectedCanvas.defaultProps = {
  onFullscreen: () => {},
  onRender: () => {},
};
