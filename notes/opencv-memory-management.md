# OpenCV.js Memory Management

Objects like `Mat` that are passed back from OpenCV.js to JavaScript must be
deleted after use or memory will eventually be exhausted and then the app will
crash. Below are some conventions that this codebase follows to try to minimize
the chance of memory leaks in the course of using OpenCV.js:

1. Avoid using OpenCV functions in the first place (e.g. use glMatrix for matrix
   multiplication instead of `cv.gemm`)
2. Anywhere an OpenCV object is created there must be a comment describing where
   it is deleted
3. OpenCV objects should be converted to JavaScript objects as soon as practical
   and then deleted
4. Avoid returning or passing around OpenCV objects
5. After deleting an OpenCV object, set the corresponding variable to undefined
   so analysis tools can help catch cases where the object is accidentally used
   after deletion

Make sure to delete:

* Objects created by `new cv.Mat()` and `new cv.MatVector()`
* `Mat`s returned by 
    * `cv.matFromArray`
    * `MatVector`'s `get`
    * `cv.matFromImageData`
    * `cv.findHomography`

Check memory usage with `window.performance.memory.usedJSHeapSize`.
