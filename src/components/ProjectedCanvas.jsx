import React, { forwardRef, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/* eslint-disable no-param-reassign */
function resizeCanvas(canvas) {
  const { width, height } = canvas.getBoundingClientRect();

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

const ProjectedCanvas = forwardRef(({
  onFullscreen,
  onResize,
  onRender,
}, projectedCanvasRef) => {
  const canvasRef = projectedCanvasRef || useRef();

  const resizeAndRender = useCallback(() => {
    resizeCanvas(canvasRef.current);
    console.log(`Projected canvas size is ${canvasRef.current.width}x${canvasRef.current.height}`);
    onResize();
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

  useEffect(() => {
    canvasRef.current.requestFullscreen();
  }, [canvasRef]);

  return (
    <canvas ref={canvasRef} width={1280} height={720} />
  );
});

ProjectedCanvas.propTypes = {
  onFullscreen: PropTypes.func,
  onResize: PropTypes.func,
  onRender: PropTypes.func,
};

ProjectedCanvas.defaultProps = {
  onFullscreen: () => {},
  onResize: () => {},
  onRender: () => {},
};

export default ProjectedCanvas;
