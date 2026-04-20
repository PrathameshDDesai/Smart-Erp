import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function StressDetection() {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    // Request camera access
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s);
        setHasCamera(true);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.error("Camera access denied:", err);
        setHasCamera(false);
      });

    return () => {
      // Clean up stream on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const openCamera = async () => {
      if(stream) return;
      try {
          const s = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(s);
          setHasCamera(true);
          if (videoRef.current) {
              videoRef.current.srcObject = s;
          }
      } catch (err) {
          console.error("Camera error:", err);
          alert("Could not access camera");
      }
  };

  const stopCamera = () => {
      if(stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setHasCamera(false);
      }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) {
        alert("Please enter how you are feeling.");
        return;
    }

    setLoading(true);
    setResult(null);

    try {
      let imageBase64 = null;
      if (hasCamera && videoRef.current) {
        // Capture snapshot
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        imageBase64 = canvas.toDataURL('image/jpeg', 0.8);
      } else {
        alert("Webcam is required to detect facial emotion. Please allow camera access.");
        setLoading(false);
        return;
      }

      const res = await fetch('http://localhost:5000/api/ai/analyze-stress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64, 
          text,
          prn: user?.role === 'STUDENT' ? user?.prn : null
        })
      });

      if (!res.ok) throw new Error("Analysis failed");
      
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing stress level. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stress-detection-page" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '10px' }}>Mood & Wellness Check</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Check your stress levels and get AI suggestions. We use your webcam and text input to analyze your mood.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>1. Look at the camera</h3>
          {!hasCamera ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
              <p style={{ marginBottom: '15px' }}>Camera access is off</p>
              <button 
                onClick={openCamera}
                style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Enable Camera
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={{ width: '100%', borderRadius: '8px', border: '2px solid var(--primary-light)', background: '#000' }} 
              />
              <button 
                onClick={stopCamera}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
              >
                Stop
              </button>
            </div>
          )}
          {/* Hidden canvas for taking snapshots */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>2. How are you feeling?</h3>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="E.g. I am feeling overwhelmed with the upcoming exams..."
            style={{ 
              width: '100%', 
              flex: '1', 
              minHeight: '120px', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              resize: 'none',
              marginBottom: '15px',
              fontFamily: 'inherit'
            }}
          />
          <button 
            onClick={handleAnalyze} 
            disabled={loading || !hasCamera || !text.trim()}
            style={{
              padding: '12px',
              background: loading || !hasCamera || !text.trim() ? 'var(--text-secondary)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: loading || !hasCamera || !text.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              transition: 'all 0.3s'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze My Mood'}
          </button>
        </div>
      </div>

      {result && (
        <div style={{ 
          padding: '25px', 
          backgroundColor: 'var(--bg-secondary)', 
          borderRadius: '12px', 
          border: '1px solid var(--border)',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              width: '50px', 
              height: '50px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '24px',
              marginRight: '15px',
              background: result.mood === 'Stressed' || result.mood === 'Sad' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(75, 192, 192, 0.2)',
              color: result.mood === 'Stressed' || result.mood === 'Sad' ? '#ff6384' : '#4bc0c0'
            }}>
              {result.mood === 'Happy' ? '😊' : result.mood === 'Sad' ? '😢' : result.mood === 'Stressed' ? '😰' : '😐'}
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Detected Mood: {result.mood}</h3>
              {result.alertTeacher && (
                 <span style={{ fontSize: '12px', color: '#ff6384', fontWeight: 'bold' }}>Alert generated for your faculty guide.</span>
              )}
            </div>
          </div>

          <h4 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>Suggested Actions for You:</h4>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
            {result.suggestions?.map((s, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
