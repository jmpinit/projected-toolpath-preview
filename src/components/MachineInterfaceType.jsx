import React, { useState } from 'react';

export default function MachineInterfaceType({ onChange }) {
  const [selectedOption, setSelectedOption] = useState('manual'); // Default selected option

  const handleSelectChange = (e) => {
    setSelectedOption(e.target.value);
    onChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor="machineInterface">Machine Interface Type:</label>
      <select
        id="machineInterface"
        name="machineInterface"
        value={selectedOption}
        onChange={handleSelectChange}
      >
        <option value="manual">Manual</option>
        <option value="grbl">Grbl</option>
        <option value="axidraw">AxiDraw</option>
        <option value="hpgl">HPGL</option>
      </select>
    </div>
  );
}
