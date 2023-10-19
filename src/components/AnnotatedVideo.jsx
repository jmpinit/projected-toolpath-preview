import React, { forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import requestCamAccess from '../cam';
import { useAnimationFrame } from '../hooks';

const VideoContainer = styled.div`
  display: grid;
`;

const AbsCanvas = styled.canvas`
  grid-column: 1;
  grid-row: 1;
`;

const AbsVideo = styled.video`
  grid-column: 1;
  grid-row: 1;
`;

const AnnotatedVideo = forwardRef(({
  onClick,
  onUpdate,
  showVideo,
  transform,
  canvasRef: incomingCanvasRef,
}, videoRef) => {
  const canvasRef = incomingCanvasRef || useRef();
  const [hasCamAccess, setHasCamAccess] = useState(false);

  // Initialize the camera access and once we have it, the canvas
  useEffect(() => {
    const video = videoRef.current;

    (async () => {
      await requestCamAccess(video);
      setHasCamAccess(true);

      if (
        canvasRef.current.width !== video.videoWidth
        || canvasRef.current.height !== video.videoHeight
      ) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
    })();
  }, []);

  useAnimationFrame(() => {
    if (onUpdate === undefined) {
      return;
    }

    if (videoRef.current === undefined || canvasRef.current === undefined) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    onUpdate(videoRef.current, canvasRef.current);
  }, [hasCamAccess, onUpdate]);

  return (
    <VideoContainer onClick={onClick}>
      <AbsVideo ref={videoRef} hidden={showVideo} />
      <AbsCanvas
        ref={canvasRef}
        width={canvasRef.current?.width}
        height={canvasRef.current?.height}
      />
    </VideoContainer>
  );
});

AnnotatedVideo.propTypes = {
  onClick: PropTypes.func,
  onUpdate: PropTypes.func,
  showVideo: PropTypes.bool,
};

AnnotatedVideo.defaultProps = {
  onClick: () => {},
  onUpdate: () => {},
  showVideo: false,
};

export default AnnotatedVideo;
