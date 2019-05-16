const FILE = '../video/chrome.webm';
const NUM_CHUNKS = 6;
const video = document.querySelector('video');

if (!window.MediaSource) {
  console.log('The MediaSource API is not available on this platform!');
}

const mediaSource = new MediaSource();

video.src = window.URL.createObjectURL(mediaSource);

const play = video => {
  const playPromise = video.play();
  // In browsers that don’t yet support this functionality,
  // playPromise won’t be defined.
  if (playPromise !== undefined) {
    let _pp = new Promise((resolve, reject) => {
      playPromise
        .then(function() {
          resolve();
        })
        .catch(function(error) {
          // Automatic playback failed.
          // Show a UI element to let the user manually start playback.
          reject(error);
        });
    });
    _pp.catch(err => {
      console.log(err);
    });
    return _pp;
  }
};

const sourceOpenHandler = () => {
  let sourceBuffer = mediaSource.addSourceBuffer(
    'video/webm; codecs="vorbis,vp8"',
  );
  console.log(sourceBuffer);
  log('MediaSource readyState: ' + this.readyState);
  let i = 0;
  get(FILE, function(uInt8Arr) {
    let file = new Blob([uInt8Arr], {
      type: 'video/webm',
    });
    let chunkSize = Math.ceil(file.size / NUM_CHUNKS);
    log('Number of chunks: ' + NUM_CHUNKS);
    log('Chunk size: ' + chunkSize + ', total size: ' + file.size);
    (function _readChunk(i) {
      let reader = new FileReader();
      reader.onload = function(e) {
        sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
        let appendHandler = function(e) {
          var sourceBuffer = e.target;
          sourceBuffer.removeEventListener('updateend', appendHandler);
          if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
            mediaSource.endOfStream();
          }
        };
        log('Appending chunk: ' + i);
        if (i === NUM_CHUNKS - 1) {
          sourceBuffer.addEventListener('updateend', appendHandler);
        } else {
          if (video.paused) {
            play(video); // Start playing after 1st chunk is appended.
          }
          _readChunk(++i);
        }
      };

      let startByte = chunkSize * i;
      let chunk = file.slice(startByte, startByte + chunkSize);

      reader.readAsArrayBuffer(chunk);
    })(i);
  });
};

mediaSource.addEventListener('sourceopen', sourceOpenHandler);
mediaSource.addEventListener('sourceended', function() {
  log('MediaSource readyState: ' + this.readyState);
});

const get = (url, cb) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();

  xhr.onload = function() {
    if (xhr.status !== 200) {
      return false;
    }
    cb(new Uint8Array(xhr.response));
  };
};

const log = msg => {
  document.getElementById('data').innerHTML += msg + '<br /><br />';
};
