import fs from 'fs';
import path from 'path';
import { parse, interpret } from '../src/gcode';

const ncHard = fs.readFileSync(path.join(__dirname, 'gcode/hard.nc'), 'utf8');

test('Parse and interpret test files', () => {
  interpret(ncHard);
});

test('Extract expected path', () => {
  const { path: toolPath } = interpret([
    'G0 X0 Y0',
    'G1 X1 Y1',
    'G1 X2 Y2',
  ].join('\n'));

  expect(toolPath).toEqual([
    [0, 0, 0],
    [0, 0, 0],
    [1, 1, 0],
    [2, 2, 0],
  ]);
});

test('Error on commands after program end', () => {
  expect(() => interpret('G0 X0 Y0\nM30\nG0 X1 Y1\n')).toThrow();
});
