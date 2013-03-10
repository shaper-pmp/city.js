### City.js
Demo of a random, procedurally-generated cityscape (work-in-progress).

## Demo

[Click here for the demo](http://htmlpreview.github.com/?https://github.com/shaper-pmp/city.js/blob/master/index.html), served straight out of the GitHub repo trunk.

## Latest changes

* Helicam added - press 'h' to toggle.
* Helicopter orientation now also linearly interpolated (for smooth changes of orientation when following spline path).
* Streetlight models.
* Simple face-intersection detection and resolution - now vertical faces should no longer overlap and cause texture-flickering.
* Helicopter/searchlight (traces a predefined spline-curve path around the city to show off dynamic lighting - left arrow key pauses flight, right arrow key resumes).

## Known bugs

* *None*

## Future plans

* Improve procedurally generated random textures.
* White lines on road.
* Cars (as agents) tracing their own randomly-selected paths through city... perhaps even with collision-avoidance for more realistic behaviour?
* Some sort of "grand tour" mode, which moves the camera on a randomly-generated spline-curve pathway through the city, diving between buildings, rotating around a specific one, pulling out/up/back for a broader view, etc.