import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophoneAlt } from '@fortawesome/free-solid-svg-icons';

export const App = () => {
  const [webAudioRecorder, setWebAudioRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(5);
  const audio = useRef(null);
  const micClassName = isRecording
    ? 'mic shake-rotate shake-freeze red'
    : 'mic shake-rotate shake-freeze green';

  useEffect(() => {
    let interval = null;
    if (isRecording && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    }
    if (isRecording && seconds === 0) {
      webAudioRecorder.finishRecording();
      setIsRecording(false);
    }
    return () => clearInterval(interval);
  }, [isRecording, seconds]);

  const manageRecording = () => {
    let options = { audio: true, video: false };

    navigator.mediaDevices.getUserMedia(options).then(stream => {
      if (!isRecording) {
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        let audioContext = new AudioContext();
        let source = audioContext.createMediaStreamSource(stream);

        let newWebAudioRecorder = new WebAudioRecorder(source, {
          workerDir: 'webaudiorecorder/',
          encoding: 'mp3',
          options: {
            encodeAfterRecord: true,
            mp3: { bitRate: '320' },
          },
        });

        newWebAudioRecorder.onComplete = (newWebAudioRecorder, blob) => {
          // create a temporary URL that we can use as the src attribute for our audio element (audioElement)
          let audioElementSource = window.URL.createObjectURL(blob);
          // set this URL as the src attribute of our audio element
          audio.current.src = audioElementSource;
          // add controls so we can see the audio element on the page
          audio.current.controls = true;
        };
        newWebAudioRecorder.onError = (newWebAudioRecorder, err) => {
          console.error(err);
        };

        newWebAudioRecorder.startRecording();
        audio.current.controls = false;
        setWebAudioRecorder(newWebAudioRecorder);
        setSeconds(5);
        setIsRecording(true);
      } else {
        setIsRecording(false);
        setSeconds(5);
      }
    });
  };

  return (
    <div className="container">
      <FontAwesomeIcon
        icon={faMicrophoneAlt}
        className={micClassName}
        onClick={manageRecording}
      />
      {isRecording && <div className="time">{seconds}</div>}
      <audio className="audio" ref={audio}></audio>
    </div>
  );
};
