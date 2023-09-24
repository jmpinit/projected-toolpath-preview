import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const ProjectionCanvas = styled.canvas`
  width: 100%;
  height: 100%;
`;

export default function ProjectionUI() {
  return (
    <ProjectionCanvas width={1920} height={1080} />
  );
}
