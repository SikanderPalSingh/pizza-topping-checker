import React, { useRef, useState, useEffect } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    mobilenet.load().then(m => setModel(m));
    async function startCamera() {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    }
    startCamera();
  }, []);

  const captureAndDetect = async () => {
    if (!model) return alert('Model is loading, please wait...');
    setIsDetecting(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const preds = await model.classify(canvas);
    setPredictions(preds);
    setIsDetecting(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: 'auto', padding: 20, fontFamily: 'Segoe UI', textAlign: 'center' }}>
      <h1>Pizza Topping Checker</h1>
      <video ref={videoRef} style={{ width: '100%', borderRadius: 10, border: '2px solid #ddd' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={captureAndDetect} disabled={isDetecting} style={{ marginTop: 10, padding: '10px 20px', fontSize: 16 }}>
        {isDetecting ? 'Detecting...' : 'Capture & Detect Toppings'}
      </button>
      <div style={{ marginTop: 20, textAlign: 'left' }}>
        {predictions.length > 0 ? (
          <ul>{predictions.map((p, i) => <li key={i}><strong>{p.className}</strong>: {(p.probability * 100).toFixed(2)}%</li>)}</ul>
        ) : <p>No predictions yet. Capture an image.</p>}
      </div>
    </div>
  );
}

export default App;