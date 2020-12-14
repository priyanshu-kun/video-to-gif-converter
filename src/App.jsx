import React, { useState, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

const ffmpeg = createFFmpeg({ log: true });

function App() {
  const [ready, setReady] = useState(false);
  const [video, setVideo] = useState(undefined);
  const [gif, setGif] = useState();

  const load = async () => {
    await ffmpeg.load();
    setReady(true);
  };

  const convertGif = async () => {
    // read file in webassembly file system - OK, that's intersting but if you want to use this utility you must need to know webassembly file system. link to ffmpeg webassembly docs: https://ffmpegwasm.github.io/
    await ffmpeg.FS('writeFile', 'test.mp4', await fetchFile(video));

    // Run ffmpeg command line utlity
    await ffmpeg.run(
      '-i',
      'test.mp4',
      '-t',
      '3.5',
      '-ss',
      '2.0',
      '-f',
      'gif',
      'out.gif',
    );

    // read a file in file system
    const data = await ffmpeg.FS('readFile', 'out.gif');

    // create URL of raw data
    const url = URL.createObjectURL(new Blob([data.buffer]), {
      type: 'image/gif',
    });

    console.log('Gif URL: ', url);

    // update the state of components
    setGif(url);
  };

  useEffect(() => {
    load();
  }, []);

  return ready ? (
    <div className="App">
      {video && (
        <div>
          <video controls width="500" src={URL.createObjectURL(video)}></video>
        </div>
      )}
      <input type="file" onChange={(e) => setVideo(e.target.files?.item(0))} />

      <h3>Result</h3>
      <button onClick={convertGif}>Convert to gif</button>
      {gif && <img src={gif} alt="resulted gif" width="500" />}
      {gif && (
        <a href={gif} download>
          <button>Download file</button>
        </a>
      )}
    </div>
  ) : (
    <h1>Loading...</h1>
  );
}

export default App;
