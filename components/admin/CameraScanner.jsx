'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export default function CameraScanner({ onScan, isScanning = true, onCameraError, onStatusChange }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // Sync latest props into refs to avoid breaking animation frames
  const isScanningRef = useRef(isScanning);
  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const [hasCamera, setHasCamera] = useState(true);
  const [cameraPermission, setCameraPermission] = useState('prompt'); // 'prompt' | 'granted' | 'denied'
  const [activeFacingMode, setActiveFacingMode] = useState('environment'); // 'environment' | 'user'
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [processingFile, setProcessingFile] = useState(false);
  const [fileScanError, setFileScanError] = useState(null);
  const [isSecureContext, setIsSecureContext] = useState(true);

  // 1. Initialize Native BarcodeDetector (Chrome/Edge/Android/Safari 17+) if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSec = window.isSecureContext ?? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      setIsSecureContext(isSec);

      if ('BarcodeDetector' in window) {
        try {
          barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] });
        } catch (e) {
          console.warn('BarcodeDetector initialization fallback:', e);
          barcodeDetectorRef.current = null;
        }
      }
    }
  }, []);

  // Safe resolver for jsQR (handles both ES module and CommonJS default exports)
  const getQRDecoder = useCallback(() => {
    if (typeof jsQR === 'function') return jsQR;
    if (jsQR && typeof jsQR.default === 'function') return jsQR.default;
    return null;
  }, []);

  // Safe camera stream shutdown
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isCameraActive,
        isScanning,
        cameraPermission,
        cameraError,
        hasCamera,
      });
    }
  }, [isCameraActive, isScanning, cameraPermission, cameraError, hasCamera, onStatusChange]);

  // Frame processing loop (Throttled to ~10-12 checks/sec for low CPU and fluid 60fps UI)
  const tick = useCallback(async () => {
    if (!isScanningRef.current) return;

    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
      if (isScanningRef.current) {
        animFrameIdRef.current = requestAnimationFrame(tick);
      }
      return;
    }

    const now = performance.now();
    if (now - lastScanTimeRef.current >= 85) {
      lastScanTimeRef.current = now;
      let detectedCode = null;

      // 1. Try hardware-accelerated BarcodeDetector if available
      if (barcodeDetectorRef.current) {
        try {
          const barcodes = await barcodeDetectorRef.current.detect(video);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            detectedCode = barcodes[0].rawValue.trim();
          }
        } catch {
          // Fall back to jsQR
        }
      }

      // 2. Fallback to CPU-based jsQR
      if (!detectedCode) {
        const decoder = getQRDecoder();
        const canvas = canvasRef.current;
        if (decoder && canvas) {
          // Downscale to max 640px for 5-10x faster decoding and lower CPU draw
          const maxDim = Math.max(video.videoWidth, video.videoHeight);
          const scale = maxDim > 640 ? 640 / maxDim : 1;
          const w = Math.floor(video.videoWidth * scale);
          const h = Math.floor(video.videoHeight * scale);

          if (w > 0 && h > 0) {
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, w, h);
              try {
                const imgData = ctx.getImageData(0, 0, w, h);
                const code = decoder(imgData.data, imgData.width, imgData.height, {
                  inversionAttempts: 'attemptBoth',
                });
                if (code && code.data && code.data.trim()) {
                  detectedCode = code.data.trim();
                }
              } catch {
                // Ignore transient frame draw race condition
              }
            }
          }
        }
      }

      if (detectedCode && isScanningRef.current) {
        onScanRef.current(detectedCode);
        return; // Scanning paused until parent resets isScanning
      }
    }

    if (isScanningRef.current) {
      animFrameIdRef.current = requestAnimationFrame(tick);
    }
  }, [getQRDecoder]);

  // Request camera stream with multi-tiered constraint fallback
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setAutoplayBlocked(false);

    // Verify browser support for getUserMedia
    if (!navigator?.mediaDevices?.getUserMedia) {
      setHasCamera(false);
      const isSec = typeof window !== 'undefined' ? (window.isSecureContext ?? false) : false;
      const err = isSec
        ? 'No video camera detected or camera API not supported by your browser.'
        : 'Camera streaming requires HTTPS or localhost. If connecting via local network IP (e.g. 192.168.x.x), please use the "Scan via Photo" button below or access via HTTPS.';
      setCameraError(err);
      if (onCameraError) onCameraError(err);
      return;
    }

    // Progressive constraint attempt helper
    const attemptStream = async () => {
      // Tier 1: Try specific device ID or ideal facing mode & resolution
      try {
        const constraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : {
                facingMode: { ideal: activeFacingMode },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
          audio: false,
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err1) {
        console.warn('Camera Tier 1 constraint rejected:', err1?.name || err1);
      }

      // Tier 2: Try relaxed facingMode constraint
      try {
        const constraints = {
          video: { facingMode: activeFacingMode },
          audio: false,
        };
        return await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err2) {
        console.warn('Camera Tier 2 constraint rejected:', err2?.name || err2);
      }

      // Tier 3: Universal fallback (any available camera)
      return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    };

    try {
      const stream = await attemptStream();
      streamRef.current = stream;

      // Enumerate available video inputs for switcher
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setAvailableDevices(videoInputs);
        } catch {
          // ignore
        }
      }

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('muted', 'true');

        // Check if track supports torch
        const track = stream.getVideoTracks()[0];
        if (track?.getCapabilities) {
          const caps = track.getCapabilities();
          setHasTorch(Boolean(caps && 'torch' in caps));
        } else {
          setHasTorch(false);
        }

        // Wait for video to have metadata before invoking play
        await new Promise((resolve) => {
          if (video.readyState >= 2) {
            resolve();
          } else {
            video.onloadedmetadata = () => resolve();
            setTimeout(resolve, 800);
          }
        });

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video play prevented by browser policy:', playErr);
          setAutoplayBlocked(true);
        }

        setIsCameraActive(true);
        setCameraPermission('granted');
      }
    } catch (err) {
      console.warn('Camera initiation failed:', err);
      let message = 'Unable to access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        message = 'Camera permission denied. Please click the camera icon in your browser address bar to allow access.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setHasCamera(false);
        message = 'No video camera detected on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera hardware is currently in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        message = 'Camera does not meet requested resolution. Please retry.';
      }

      setCameraError(message);
      if (onCameraError) onCameraError(message);
    }
  }, [activeFacingMode, selectedDeviceId, stopCamera, onCameraError]);

  // Start camera on mount, stop when unmounting
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Start/pause frame analysis ticker when isScanning or isCameraActive changes
  // Note: We DO NOT stop the hardware camera stream when isScanning is temporarily false!
  useEffect(() => {
    if (isCameraActive && isScanning) {
      animFrameIdRef.current = requestAnimationFrame(tick);
    } else if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isCameraActive, isScanning, tick]);

  // Switch facing mode (back/front)
  const toggleCameraFacing = () => {
    setSelectedDeviceId('');
    setActiveFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Switch specific device
  const handleDeviceChange = (e) => {
    setSelectedDeviceId(e.target.value);
  };

  // Toggle flashlight/torch (for low-light auditorium environments)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchOn(nextTorch);
    } catch (err) {
      console.warn('Torch toggle error:', err);
    }
  };

  // Handle direct play user gesture when autoplay policy blocks video.play()
  const handleManualPlay = async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setAutoplayBlocked(false);
      } catch (e) {
        console.warn('Manual play failed:', e);
      }
    }
  };

  // Photo / File Upload Fallback: Works 100% on ANY browser or insecure HTTP network
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProcessingFile(true);
    setFileScanError(null);

    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectUrl;
      });

      let foundToken = null;

      // 1. Native detector
      if (barcodeDetectorRef.current) {
        try {
          const barcodes = await barcodeDetectorRef.current.detect(img);
          if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
            foundToken = barcodes[0].rawValue.trim();
          }
        } catch {
          // fallback
        }
      }

      // 2. jsQR fallback
      if (!foundToken) {
        const decoder = getQRDecoder();
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });
          if (code && code.data && code.data.trim()) {
            foundToken = code.data.trim();
          }
        }
      }

      URL.revokeObjectURL(objectUrl);

      if (foundToken) {
        onScanRef.current(foundToken);
      } else {
        setFileScanError('No readable QR code found in this photo. Try snapping closer under good lighting.');
      }
    } catch (err) {
      console.error('File scan error:', err);
      setFileScanError('Could not process the uploaded photo. Please try another image.');
    } finally {
      setProcessingFile(false);
      if (event.target) event.target.value = '';
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Hidden file input for Photo / Image scan fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

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

        {/* Scanner Paused State Overlay (when attendee pass is being verified) */}
        {isCameraActive && !isScanning && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5, 5, 5, 0.6)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
              color: 'var(--color-gold-light)',
              padding: '1rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>⏸️</div>
            <strong style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>SCANNER STANDBY</strong>
            <span style={{ fontSize: '0.75rem', color: 'rgba(253, 251, 247, 0.75)', marginTop: '0.25rem' }}>
              Camera stream is ready for next attendee
            </span>
          </div>
        )}

        {/* Autoplay Blocked Overlay (Browser requires user tap) */}
        {autoplayBlocked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 8, 5, 0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem',
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🎬</div>
            <h4 style={{ color: 'var(--color-gold-light)', margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
              Camera Ready
            </h4>
            <p style={{ color: 'rgba(253, 251, 247, 0.75)', fontSize: '0.8rem', maxWidth: '320px', margin: '0 0 1rem 0' }}>
              Tap below to start video preview feed.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.5rem 1.25rem' }}
              onClick={handleManualPlay}
            >
              ▶ Start Camera Preview
            </button>
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
            <p style={{ color: 'rgba(253, 251, 247, 0.75)', fontSize: '0.8rem', maxWidth: '360px', margin: '0 0 1.25rem 0', lineHeight: 1.5 }}>
              {cameraError}
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
                onClick={() => fileInputRef.current?.click()}
              >
                📸 Snap / Upload QR Photo
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
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

      {/* File Scanner Error Toast */}
      {fileScanError && (
        <div
          style={{
            margin: '0.75rem auto 0 auto',
            maxWidth: '520px',
            padding: '0.5rem 0.75rem',
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid rgba(231, 76, 60, 0.4)',
            borderRadius: '6px',
            color: '#ff8a80',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>⚠️ {fileScanError}</span>
          <button
            type="button"
            onClick={() => setFileScanError(null)}
            style={{ background: 'none', border: 'none', color: '#ff8a80', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Insecure Context (HTTP on local network) notice */}
      {!isSecureContext && (
        <div
          style={{
            margin: '0.75rem auto 0 auto',
            maxWidth: '520px',
            padding: '0.5rem 0.75rem',
            background: 'rgba(241, 196, 15, 0.12)',
            border: '1px solid rgba(241, 196, 15, 0.35)',
            borderRadius: '6px',
            color: '#f9e79f',
            fontSize: '0.74rem',
            lineHeight: 1.4,
          }}
        >
          💡 <strong>Tip for Remote Devices:</strong> Browsers require HTTPS or localhost for live camera video. When connecting via phone/tablet over LAN, use <strong>📸 Snap / Upload QR Photo</strong> below to scan with your phone camera!
        </div>
      )}

      {/* Camera Controls Bar */}
      <div className="camera-controls-bar">
        {/* Device Switcher Dropdown (if multiple video inputs detected) */}
        {availableDevices.length > 1 && isCameraActive && (
          <select
            className="admin-select"
            value={selectedDeviceId}
            onChange={handleDeviceChange}
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.5rem', maxWidth: '170px' }}
            title="Select camera sensor"
          >
            <option value="">Default ({activeFacingMode === 'environment' ? 'Back' : 'Front'})</option>
            {availableDevices.map((dev, idx) => (
              <option key={dev.deviceId || idx} value={dev.deviceId}>
                {dev.label || `Camera ${idx + 1}`}
              </option>
            ))}
          </select>
        )}

        {/* Flip Front / Back Camera */}
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

        {/* Torch / Flashlight (where supported on mobile) */}
        {hasTorch && isCameraActive && (
          <button
            type="button"
            className="btn btn-outline"
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.75rem',
              borderColor: torchOn ? '#2ECC71' : undefined,
              color: torchOn ? '#2ECC71' : undefined,
            }}
            onClick={toggleTorch}
            title="Toggle auditorium scanner flashlight"
          >
            🔦 Flashlight {torchOn ? 'ON' : 'OFF'}
          </button>
        )}

        {/* Photo / File Instant Scan (Universal Fallback) */}
        <button
          type="button"
          className="btn btn-outline"
          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
          onClick={() => fileInputRef.current?.click()}
          disabled={processingFile}
          title="Take photo of QR or select an image file"
        >
          {processingFile ? '⏳ Scanning Image...' : '📸 Snap / Upload Photo'}
        </button>

        {/* Pause / Resume Live Feed */}
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
          {isCameraActive ? '⏸️ Stop Camera' : '▶️ Start Camera'}
        </button>
      </div>
    </div>
  );
}
