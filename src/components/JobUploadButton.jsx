import React, { useCallback } from 'react';
import { connect } from 'react-redux';
import { interpret, parse } from '../gcode';

function JobUploadButton({ dispatch }) {
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const { path: totalPath } = interpret(content);

      // Separate paths based on Z
      const paths = [];
      let currentPath = [];
      for (let i = 0; i < totalPath.length; i += 1) {
        const [x, y, z] = totalPath[i];

        if (z > 0) {
          if (currentPath.length > 0) {
            paths.push(currentPath);
            currentPath = [];
          }
        } else {
          currentPath.push({ x, y });
        }
      }

      dispatch({
        type: 'CNC_SET_TOOLPATH',
        payload: paths,
      });
    };

    reader.readAsText(file);
  }, []);

  return (
    <div>
      <input
        type="file"
        id="fileInput"
        accept=".nc,.gcode"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button type="button" onClick={() => document.getElementById('fileInput').click()}>
        Upload G-code
      </button>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    interfaceType: state.cnc.interfaceType,
  };
}

export default connect(mapStateToProps)(JobUploadButton);
