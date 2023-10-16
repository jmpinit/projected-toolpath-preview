import React, { useEffect, useRef, useState } from 'react';

const vertexShaderSource = `
  attribute vec4 aVertexPosition;
  attribute vec2 aTextureCoord;
  varying highp vec2 vTextureCoord;
  uniform mat3 uMatrix;
  void main(void) {
    gl_Position = vec4((uMatrix * vec3(aVertexPosition)).xy, 0, aVertexPosition.w);
    vTextureCoord = aTextureCoord;
  }
`;

const fragmentShaderSource = `
  varying highp vec2 vTextureCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTextureCoord);
  }
`;

export default function PerspectiveCanvas({ transform, canvas, width, height, renderTick, ...delegated }) {
  const canvasRef = useRef(null);
  const [glCtx, setGlCtx] = useState(null);
  const [texture, setTexture] = useState(null);
  const [matrixLocation, setMatrixLocation] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !canvas) {
      return;
    }

    const glCanvas = canvasRef.current;
    const gl = glCanvas.getContext('webgl');

    if (!gl) {
      console.error('Unable to initialize WebGL. Your browser may not support it.');
      return;
    }

    // console.log(targetCanvas.width, targetCanvas.height, canvas.width, canvas.height)

    setGlCtx(gl);
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);

    // Compile shaders and link them into a program
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, vertexShaderSource);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, fragmentShaderSource);
    gl.compileShader(fs);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vs);
    gl.attachShader(shaderProgram, fs);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    // Look up where the vertex data needs to go.
    const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    const texCoordLocation = gl.getAttribLocation(shaderProgram, 'aTextureCoord');

    // Provide texture coordinates for the rectangle.
    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      1.0, 1.0,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Define the vertices for a unit rectangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1.0, 1.0,
      1.0, 1.0,
      -1.0, -1.0,
      -1.0, -1.0,
      1.0, 1.0,
      1.0, -1.0,
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Create a texture
    const tex = gl.createTexture();
    setTexture(tex);

    const matLoc = gl.getUniformLocation(shaderProgram, 'uMatrix');
    setMatrixLocation(matLoc);

    // if (canvas === undefined || canvas.width === 0 || canvas.height === 0) {
    //   return;
    // }
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // const ctx = canvas.getContext('2d');
    //
    // const imageDataArray = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, imageDataArray);
    //
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    //
    // // Set the matrix.
    // gl.uniformMatrix3fv(matLoc, false, transform);
    //
    // // Draw the rectangle
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);

    // console.log(canvas.width, canvas.height)
  }, [transform, canvas, canvasRef, setGlCtx, setTexture, setMatrixLocation]);
  // }, [transform, canvas, canvasRef, renderTick]);

  useEffect(() => {
    if (!glCtx || !texture) {
      return;
    }

    if (canvas === undefined || canvas.width === 0 || canvas.height === 0) {
      return;
    }

    glCtx.viewport(0, 0, glCtx.canvas.width, glCtx.canvas.height);

    glCtx.bindTexture(glCtx.TEXTURE_2D, texture);
    const ctx = canvas.getContext('2d');
    const imageDataArray = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    glCtx.texImage2D(glCtx.TEXTURE_2D, 0, glCtx.RGBA, canvas.width, canvas.height, 0, glCtx.RGBA, glCtx.UNSIGNED_BYTE, imageDataArray);

    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_S, glCtx.CLAMP_TO_EDGE);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_WRAP_T, glCtx.CLAMP_TO_EDGE);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MIN_FILTER, glCtx.NEAREST);
    glCtx.texParameteri(glCtx.TEXTURE_2D, glCtx.TEXTURE_MAG_FILTER, glCtx.NEAREST);

    // Set the matrix.
    glCtx.uniformMatrix3fv(matrixLocation, false, transform);

    // Draw the rectangle
    glCtx.clear(glCtx.COLOR_BUFFER_BIT);
    glCtx.drawArrays(glCtx.TRIANGLES, 0, 6);

    console.log(canvas.width, canvas.height)
  }, [glCtx, texture, canvas, renderTick]);

  return <canvas ref={canvasRef} width={width} height={height} {...delegated} />;
}

PerspectiveCanvas.defaultProps = {
  transform: [1, 0, 0, 0, 1, 0, 0, 0, 1],
};
