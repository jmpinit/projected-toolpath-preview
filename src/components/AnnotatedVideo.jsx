import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import requestCamAccess from '../cam';
import { useAnimationFrame } from '../hooks';
import PerspectiveCanvas from './PerspectiveCanvas';

const VideoContainer = styled.div`
  display: grid;
`;

const AbsCanvas = styled(PerspectiveCanvas)`
  grid-column: 1;
  grid-row: 1;
`;

const AbsVideo = styled.video`
  grid-column: 1;
  grid-row: 1;
`;

export default function AnnotatedVideo({ onClick, onUpdate, showVideo, transform }) {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [hasCamAccess, setHasCamAccess] = useState(false);
  const [renderTick, setRenderTick] = useState(0);

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

    setRenderTick(renderTick + 1);
  }, [hasCamAccess, onUpdate, setRenderTick, renderTick]);

  return (
    <VideoContainer onClick={onClick}>
      <AbsVideo ref={videoRef} hidden={showVideo} />
      <AbsCanvas
        canvas={canvasRef.current}
        width={canvasRef.current?.width}
        height={canvasRef.current?.height}
        renderTick={renderTick}
        transform={transform}
      />
      <canvas ref={canvasRef} hidden />
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
