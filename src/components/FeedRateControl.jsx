import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FeedRateControl({ onChange, min, max }) {
  const [feedRate, setFeedRate] = useState(min);

  const handleInputChange = (event) => {
    const newFeedRate = parseInt(event.target.value, 10);

    if (!Number.isNaN(newFeedRate) && newFeedRate >= min && newFeedRate <= max) {
      setFeedRate(newFeedRate);
      onChange(newFeedRate);
    }
  };

  return (
    <div>
      <label>Feed Rate (mm/min):</label>
      <input
        type="number"
        value={feedRate}
        onChange={handleInputChange}
        min={min}
        max={max}
      />
    </div>
  );
}

FeedRateControl.propTypes = {
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
};

FeedRateControl.defaultProps = {
  min: 100,
  max: 5000,
};
