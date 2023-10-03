import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// Outlines each cell
const StyledTable = styled.table`
  border-collapse: collapse;
  border: 1px solid black;

  td {
    border: 1px solid black;
  }
`;

export default function MatrixTable({ title, values, rows, cols }) {
  if (values.length !== rows * cols) {
    throw new Error('Invalid matrix dimensions');
  }

  return (
    <StyledTable>
      {title ? <caption>{title}</caption> : null}
      <tbody>
        {Array(rows).fill(0).map((_, row) => (
          <tr key={`row-${row}`}>
            {Array(cols).fill(0).map((_, col) => (
              <td key={`col-${col}`}>{values[row * cols + col].toFixed(3)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}

MatrixTable.propTypes = {
  title: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  rows: PropTypes.number,
  cols: PropTypes.number,
};

MatrixTable.defaultProps = {
  title: undefined,
  rows: 3,
  cols: 3,
};
