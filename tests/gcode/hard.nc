(G-code Test Program)
T1 (Load Tool 1)
G17 (XY Plane)
G20 (Inch Mode)
G90 (Absolute Mode)
(Blank line)

; Another type of comment
G4 P0 ; Now at the end of the line
M03 S1000 (Start Spindle Clockwise at 1000 RPM)
G0 X0 Y0 (Rapid Move to Origin)

G1 Z-0.5 F5 (Linear Move to Z-0.5 at Feedrate of 5 in/min)
G91 (Relative Mode)
G1 X1 Y0 F20 (Linear Move 1 Inch in X Direction)
G1 X0 Y1 (Linear Move 1 Inch in Y Direction)
G90 (Back to Absolute Mode)

(Now, let's test circular interpolation)
G2 X2 Y2 I1 J0 F10 (Clockwise arc to X2 Y2 with center offset I1 J0)
G3 X0 Y0 I-1 J-1 (Counter-Clockwise arc back to Origin)

G4 P2 (Dwell for 2 seconds)

M05 (Stop Spindle)
M08 (Coolant On)
M09 (Coolant Off)

(End of Program)
M30
