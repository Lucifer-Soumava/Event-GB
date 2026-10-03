'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export default function CameraScanner({ onScan, isScanning, onCameraError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [activeFacingMode, setActiveFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Frame processing loop with jsQR
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data.trim()) {
        // QR detected! Pass data to parent handler
        onScan(code.data.trim());
        return; // Pause scanning loop until reset
      }
    }

    if (isScanning) {
      animFrameIdRef.current = requestAnimationFrame(tick);
    }
  }, [isScanning, onScan]);

  // Start Camera Stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    // Verify browser support for getUserMedia
    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      const err = 'Camera access is not supported by your browser or connection (HTTPS or localhost is required).';
      setCameraError(err);
      if (onCameraError) onCameraError(err);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: activeFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
        setIsCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      let message = 'Unable to access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        message = 'Camera permission denied. Please grant camera permission in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setHasCamera(false);
        message = 'No video camera detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera hardware is currently in use by another application.';
      }

      setCameraError(message);
      if (onCameraError) onCameraError(message);
    }
  }, [activeFacingMode, stopCamera, onCameraError]);

  // Manage start / stop based on isScanning prop
  useEffect(() => {
    if (isScanning) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isScanning, startCamera, stopCamera]);

  // Start frame ticker once camera is active
  useEffect(() => {
    if (isCameraActive && isScanning) {
      animFrameIdRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isCameraActive, isScanning, tick]);

  const toggleCameraFacing = () => {
    setActiveFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="camera-scanner-container">
        {/* Live Video Element */}
        <video
          ref={videoRef}
          className="camera-video-element"
          muted
          playsInline
        />

        {/* Viewfinder Target Reticle & Laser Sweep Animation */}
        {isCameraActive && isScanning && (
          <div className="camera-overlay-reticle">
            <div className="camera-scan-laser" />
          </div>
        )}

        {/* Permission Denied / Error Overlay */}
        {cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 8, 5, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>📷</div>
            <h4 style={{ color: '#ff6b6b', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              {cameraPermission === 'denied' ? 'Camera Access Denied' : 'Camera Unavailable'}
            </h4>
            <p style={{ color: 'rgba(253, 251, 247, 0.75)', fontSize: '0.8rem', maxWidth: '340px', margin: '0 0 1rem 0' }}>
              {cameraError}
            </p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={startCamera}
              >
                🔄 Retry Camera
              </button>
            </div>
          </div>
        )}

        {/* Camera Starting Spinner */}
        {!isCameraActive && !cameraError && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0d0a07',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-gold-light)',
            }}
          >
            <div className="spinner" style={{ width: '32px', height: '32px', marginBottom: '0.75rem' }} />
            <span style={{ fontSize: '0.82rem' }}>Initializing Camera Sensor...</span>
          </div>
        )}
      </div>

      {/* Camera Controls Bar (Flip Camera, Pause / Resume) */}
      <div className="camera-controls-bar">
        {hasCamera && isCameraActive && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            onClick={toggleCameraFacing}
            title="Switch between front and back camera"
          >
            🔄 Flip Camera ({activeFacingMode === 'environment' ? 'Back' : 'Front'})
          </button>
        )}

        <button
          type="button"
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          onClick={() => {
            if (isCameraActive) {
              stopCamera();
            } else {
              startCamera();
            }
          }}
        >
          {isCameraActive ? '⏸️ Pause Scanner' : '▶️ Resume Camera'}
        </button>
      </div>
    </div>
  );
}
