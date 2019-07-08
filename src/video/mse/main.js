const FILE = './video/chunk-stream0-1.webm';
const NUM_CHUNKS = 1;
let baseUrl = './video/';
let initVideoUrl = baseUrl + 'init-stream0.webm';
let initAudioUrl = baseUrl + 'init-stream1.webm';
let index = 1,
  idx = 1;
let sourceBuffer, audioSourceBuffer;
let video = document.querySelector('video');

if (!window.MediaSource) {
  console.log('The MediaSource API is not available on this platform!');
}

let mediaSource = new MediaSource();

video.src = window.URL.createObjectURL(mediaSource);

let play = video => {
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

let sourceOpenHandler = function() {
  let sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"');
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

let sourceOpenHandler1 = function() {
  let sourceBuffer = mediaSource.addSourceBuffer(
    'video/webm; codecs="opus,vp9"',
  );
  log('MediaSource readyState: ' + this.readyState);
  fetch(DATASOURCE[0])
    .then(response => response.arrayBuffer())
    .then(buffer => {
      let file = new Blob([new Uint8Array(buffer)], {
        type: 'video/webm',
      });
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
      };
      reader.readAsArrayBuffer(file);
    });
};

let nextVideoSegment = () => {
  let url = baseUrl + `chunk-stream0-${index}.webm`;
  get(url, appendToBuffer);
  index++;
  if (index > 3) {
    videoSourceBuffer.removeEventListener('updateend', nextVideoSegment);
  }
};

let nextAudioSegment = () => {
  let url = baseUrl + `chunk-stream1-${idx}.webm`;
  get(url, appendAudioBuffer);
  idx++;
  if (idx > 3) {
    audioSourceBuffer.removeEventListener('updateend', nextAudioSegment);
  }
};

let appendToBuffer = trunk => {
  if (trunk) {
    videoSourceBuffer.appendBuffer(new Uint8Array(trunk));
  }
};

let appendAudioBuffer = trunk => {
  if (trunk) {
    audioSourceBuffer.appendBuffer(new Uint8Array(trunk));
  }
};

let onMediaSourceOpen = function() {
  videoSourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp9"'); // opus
  audioSourceBuffer = mediaSource.addSourceBuffer('audio/webm; codecs="opus"');
  log('MediaSource readyState: ' + this.readyState);
  videoSourceBuffer.addEventListener('updateend', nextVideoSegment);
  audioSourceBuffer.addEventListener('updateend', nextAudioSegment);
  mediaSource.duration = 734.178;
  get(initVideoUrl, appendToBuffer);
  get(initAudioUrl, appendAudioBuffer);
  // play(video);
};

mediaSource.addEventListener('sourceopen', onMediaSourceOpen);
mediaSource.addEventListener('sourceended', function() {
  log('MediaSource readyState: ' + this.readyState);
});
mediaSource.addEventListener('error', function(e) {
  console.log('error: ' + mediaSource.readyState);
});

let get = (url, cb) => {
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

let log = msg => {
  document.getElementById('data').innerHTML += msg + '<br /><br />';
};
