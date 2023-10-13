import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { applyHomography } from '../cv';
import ProjectedCanvas from './ProjectedCanvas';

function drawUVQuickShade(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const cellSize = 100; // Set the size of each cell
  const rows = Math.ceil(height / cellSize);
  const cols = Math.ceil(width / cellSize);

  // Draw color gradient
  // for (let y = 0; y < height; y++) {
  //   for (let x = 0; x < width; x++) {
  //     const u = x / width;
  //     const v = 1 - y / height; // Flip V so 0 is at the bottom
  //     ctx.fillStyle = `rgb(${u * 255}, ${v * 255}, 127)`;
  //     ctx.fillRect(x, y, 1, 1);
  //   }
  // }

  // Draw grid and UV coordinates
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#000000';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellSize;
      const y = row * cellSize;
      const u = (x / width).toFixed(2);
      const v = (1 - y / height).toFixed(2); // Flip V so 0 is at the bottom
      ctx.strokeRect(x, y, cellSize, cellSize);
      ctx.fillText(`U:${u}, V:${v}`, x + 5, y + 20); // Adjust text position as needed
    }
  }
}

function cncToProjector(cameraToCNC, cameraToProjector, x, y) {
  // FIXME: just cache the matrices multiplied together in the store
  const cameraToCNCMat = cv.matFromArray(3, 3, cv.CV_32F, cameraToCNC);
  const cncToCam = new cv.Mat();
  cv.invert(cameraToCNCMat, cncToCam);

  const cameraToProjectorMat = cv.matFromArray(3, 3, cv.CV_32F, cameraToProjector);

  const camPos = applyHomography(cncToCam, x, y);
  return applyHomography(cameraToProjectorMat, camPos[0], camPos[1]);
}

function camToProjector(cameraToProjector, x, y) {
  const cameraToProjectorMat = cv.matFromArray(3, 3, cv.CV_32F, cameraToProjector);
  return applyHomography(cameraToProjectorMat, x, y);
}

function ProjectedToolpath({ toolpath, annotation, project, cameraToCNC, cameraToProjector }) {
  const renderProjection = useCallback((canvas) => {
    const ctx = canvas.getContext('2d');

    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    // ctx.strokeStyle = '#ff0000';
    // ctx.lineWidth = 4;

    // console.log(adjToolpath.map((path) => path.map(({ x, y }) => cncToProjector(cameraToCNC, cameraToProjector, x, y))));
    // toolpath
    //   .map((path) => path.map(({ x, y }) => cncToProjector(cameraToCNC, cameraToProjector, x, y)))
    //   .forEach((path) => {
    //     ctx.beginPath();
    //     ctx.moveTo(path[0][0], path[0][1]);
    //     path.forEach(([x, y]) => ctx.lineTo(x, y));
    //     ctx.stroke();
    //   });

    // annotation
    //   .map(([x, y]) => camToProjector(cameraToProjector, x, y))
    //   .forEach(([x, y]) => {
    //     ctx.beginPath();
    //     ctx.arc(x, y, 10, 0, 2 * Math.PI);
    //     ctx.stroke();
    //   });

    // const annotation = [];
    // for (let y = 0; y < 720; y += 64) {
    //   for (let x = 0; x < 1280; x += 64) {
    //
    //   }
    // }

    const [a, c, e, b, d, f] = cameraToProjector;

    // const sx = canvas.width / 1280;
    // const sy = canvas.height / 720;
    //
    // const a = sx; // sx
    // const c = 0.0; // ry
    // const e = 0.0; // tx
    // const b = 0.0; // rx
    // const d = sy; // sy
    // const f = 0.0; // ty
    ctx.setTransform(a, b, c, d, e, f);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    const size = 60;
    for (let y = 0; y < 720; y += size) {
      for (let x = 0; x < 1280; x += size) {
        const u = x / 1280;
        const v = y / 720;
        ctx.fillStyle = `rgb(${u * 255}, ${v * 255}, 127)`;
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = '#000000';
        ctx.fillText(`${x.toFixed(0)}, ${y.toFixed(0)}`, x + size / 2, y + size / 2);
      }
    }

    // ctx.strokeStyle = '#ffffff';
    // ctx.lineWidth = 4;
    // annotation.forEach(([x, y]) => {
    //   ctx.beginPath();
    //   ctx.arc(x, y, 10, 0, 2 * Math.PI);
    //   ctx.stroke();
    // });

    // Draw projection points
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    project.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.stroke();
    });

    annotation
      .map(([x, y]) => camToProjector(cameraToProjector, x, y))
      .forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillText(`${x.toFixed(0)}, ${y.toFixed(0)}`, x, y); // Adjust text position as needed
      });
  }, [toolpath, annotation, project, cameraToCNC, cameraToProjector]);

  return (
    <ProjectedCanvas onRender={renderProjection} />
  );
}

function mapStateToProps(state) {
  return {
    toolpath: state.cnc.toolpath,
    annotation: state.cnc.annotation,
    project: state.cnc.project,
    cameraToProjector: state.calibration.cameraToProjector,
    cameraToCNC: state.calibration.cameraToCNC,
  };
}

export default connect(mapStateToProps)(ProjectedToolpath);
