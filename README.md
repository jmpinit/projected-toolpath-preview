# Projected Toolpath Preview

https://github.com/jmpinit/projected-toolpath-preview/assets/2086541/9d5e3b2f-8141-4f18-8909-69ea8f500971

([Full demo video here](https://vimeo.com/876037161/8e5478f0e3))

A web app to projection-map toolpaths onto CNC machine beds to preview jobs.

[Use online here.](https://jmpinit.github.io/projected-toolpath-preview/)

## Usage Instructions

1. Leave one window open somewhere you can see it.
2. Extend your display to the projector.
3. Make a new tab/window of the app for the projected graphics.
4. Move it over to the projector and hit F. The canvas should full screen there.
5. In mapping mode, use the black box on the control panel to place the
chessboard on the bed of the machine. It needs to be fully visible and with at
least a tiny bit of whitespace around it. The slider controls the scale.
6. Hit the "Detect Chessboard". The chessboard points should be highlighted on the
camera feed. You'll also see a smiley face, which is there as the default tool
path. You see something immediately because there are default machine
coordinates, but we're going to get real values for those in the next step.
7. Move the machine to each of the 4 outer chessboard points (filled in with
green). You have 2 options for this. If the machine is an AxiDraw or a CNC
using Grbl you could plug it directly into the computer, select the
appropriate interface type, hit the connect button, select the machine port,
and then jog it around with either the keyboard or the on-screen buttons. Or
you can use "manual" mode where you use some other UI to jog the machine and
just enter the coordinates by hand. At each of the corner points bring the tool
center point (TCP) as close to directly above the projected chessboard corner
point as possible. I recommend marking these points somehow (e.g. pencil) so
they don't get obscured by the machine. Once the TCP is above a point, hit the
corresponding "Store" button. Once you have the 4 corners move to the next
step.
8. Hit "Stop Mapping". The chessboard will disappear and the projector should
be projection-mapping the smiley and gnomon now. It will probably be
upside-down because the smiley was a job for the AxiDraw which has a flipped Y
axis relative to your CNC. That's ok because we're about to replace the job.
9. Hit the "Upload G-code" button. This should open a file chooser. Find a job
file that you want to preview. Once you select it you should see it in the
camera feed and the projection.

## Building

1. Install dependencies with `yarn`
2. Build app with `yarn build`
3. Open **dist/index.html** in a web browser (only tested in Google Chrome so far)

## Thanks

Developed as part of a research project for [Folk Computer](https://folk.computer/).

