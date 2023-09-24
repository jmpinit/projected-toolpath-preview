export default function requestCamAccess(video) {
  const deviceConstraints = {
    audio: false,
    video: {
      facingMode: 'environment',
      // width: { ideal: 99999 },
      // height: { ideal: 99999 },
      width: { ideal: 1280 },
    },
  };

  return new Promise((fulfill, reject) => {
    navigator.mediaDevices.getUserMedia(deviceConstraints)
      .then((stream) => {
        // eslint-disable-next-line no-param-reassign
        video.srcObject = stream;
        video.setAttribute('playsinline', true); // required to tell iOS safari we don't want fullscreen
        video.play();
      })
      .then(() => video.addEventListener('loadedmetadata', () => fulfill()))
      .catch((err) => reject(err));
  });
}

export function videoToCanvas(video, canvas) {
  // eslint-disable-next-line no-param-reassign
  canvas.height = video.videoHeight;
  // eslint-disable-next-line no-param-reassign
  canvas.width = video.videoWidth;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}
