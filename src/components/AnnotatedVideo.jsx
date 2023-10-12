import React, { useEffect, useRef, useState } from 'react';
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

export default function AnnotatedVideo({ onClick, onUpdate, showVideo }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [hasCamAccess, setHasCamAccess] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    (async () => {
      await requestCamAccess(video);
      setHasCamAccess(true);
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
      <AbsCanvas ref={canvasRef} />
    </VideoContainer>
  );
}

AnnotatedVideo.propTypes = {
  onClick: PropTypes.func,
  onUpdate: PropTypes.func.isRequired,
  showVideo: PropTypes.bool,
};

AnnotatedVideo.defaultProps = {
  onClick: () => {},
  showVideo: false,
};
