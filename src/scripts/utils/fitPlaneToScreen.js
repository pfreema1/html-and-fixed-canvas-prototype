/*
taken from:  https://gist.github.com/ayamflow/96a1f554c3f88eef2f9d0024fc42940f

var cameraZ = camera.position.z;
var planeZ = 5;
var distance = cameraZ - planeZ;
var aspect = viewWidth / viewHeight;
var vFov = camera.fov * Math.PI / 180;
var planeHeightAtDistance = 2 * Math.tan(vFov / 2) * distance;
var planeWidthAtDistance = planeHeightAtDistance * aspect;

// or

let dist = camera.position.z - mesh.position.z;
let height = ... // desired height to fit
camera.fov = 2 * Math.atan(height / (2 * dist)) * (180 / Math.PI);
camera.updateProjectionMatrix();


// Basically solving an AAS triangle https://www.mathsisfun.com/algebra/trig-solving-aas-triangles.html
https://i.stack.imgur.com/PgSn3.jpg
*/

// return height and width of plane that covers viewport at the given plane z position
export default (camera, planeZ, viewWidth, viewHeight) => {
  const cameraZ = camera.position.z;
  const distance = cameraZ - planeZ;
  const aspect = viewWidth / viewHeight;
  const vFov = (camera.fov * Math.PI) / 180;
  const height = 2 * Math.tan(vFov / 2) * distance;
  const width = height * aspect;

  return {
    width,
    height
  };
};
