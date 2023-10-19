import { applyHomography, chessboardOuterCorners } from './cv';

export function renderGnomon(ctx, homography) {
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;

  const lines = [
    [[0, 0], [0, 100]],
    [[0, 0], [100, 0]],
  ].map((points) => points.map(([x, y]) => applyHomography(homography, x, y)));

  ctx.beginPath();
  lines.forEach(([[x1, y1], [x2, y2]]) => {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  });
  ctx.stroke();
}

export function renderChessboardPoints(ctx, chessboardPoints) {
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 1;

  chessboardPoints.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.stroke();
  });
}

export function highlightOuterCorner(ctx, chessboardPoints, rows, columns) {
  const gridCorners = chessboardOuterCorners(chessboardPoints, rows, columns);

  // Highlight the 4 grid corner points
  const radius = 4;
  ctx.fillStyle = '#44ff44';
  gridCorners.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}

export function renderToolpath(ctx, toolpath, homography) {
  const toolpathInCam = toolpath
    .map((path) => path
      .map(({ x, y }) => applyHomography(homography, x, y)));

  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  toolpathInCam.forEach((path) => {
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    path.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
  });
}

/**
 * Render a chessboard pattern on a canvas element
 * @param canvas
 * @param rows - number of inner corner rows
 * @param cols - number of inner corner columns
 * @returns {*[]} - array of [x, y] coordinates of inner corners
 */
export function renderChessboard(canvas, rows, cols, xNorm, yNorm, scale) {
  const originX = canvas.width * xNorm;
  const originY = canvas.height * yNorm;

  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const chessboardAspectRatio = cols / rows;
  const canvasAspectRatio = canvas.width / canvas.height;

  let width;
  let height;
  if (canvasAspectRatio > chessboardAspectRatio) {
    // Canvas is wider than chessboard, so scale to match height
    height = canvas.height * scale;
    width = height * chessboardAspectRatio;
  } else {
    width = canvas.width * scale;
    height = width / chessboardAspectRatio;
  }

  const sqSize = (height / (rows + 1));

  const points = [];
  for (let row = 0; row < rows + 1; row += 1) {
    for (let col = 0; col < cols + 1; col += 1) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#000000' : '#ffffff';
      const x = originX + col * sqSize;
      const y = originY + row * sqSize;
      ctx.fillRect(x, y, sqSize, sqSize);

      if (row > 0 && col > 0) {
        points.push([x, y]);
      }

      if (row === 1 && col === 1) {
        console.log(`Chessboard ${rows}x${cols} rendered at ${x}, ${y}} on canvas sized ${canvas.width}x${canvas.height}`);
        console.log(`Square size is ${sqSize} and chessboard size is ${width}x${height}`);
      }
    }
  }

  return points;
}
