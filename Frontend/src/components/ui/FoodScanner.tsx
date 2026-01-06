import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Upload, X, FileImage, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface FoodScannerProps {
  onCapture: (file: File, preview: string) => void;
  onClose: () => void;
}

type ScanMode = 'choose' | 'camera' | 'preview';

export function FoodScanner({ onCapture, onClose }: FoodScannerProps) {
  const [mode, setMode] = useState<ScanMode>('choose');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure video plays when stream is set
  useEffect(() => {
    if (stream && videoRef.current && mode === 'camera') {
      setIsVideoReady(false); // Reset ready state when stream changes
      const video = videoRef.current;
      
      // Set the stream
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      
      // Function to play video
      const playVideo = async () => {
        if (!video || !video.srcObject) return;
        
        try {
          await video.play();
          console.log('Video playing successfully');
          
          // Check if video has valid dimensions
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            setIsVideoReady(true);
          }
        } catch (err: any) {
          console.error('Video play error:', err);
          // Retry after a short delay
          setTimeout(async () => {
            if (video && video.srcObject) {
              try {
                await video.play();
                console.log('Video playing after retry');
                if (video.videoWidth > 0 && video.videoHeight > 0) {
                  setIsVideoReady(true);
                }
              } catch (retryErr) {
                console.error('Video play retry error:', retryErr);
                setError('Unable to start camera preview. Please try again.');
              }
            }
          }, 500);
        }
      };
      
      // Function to check video readiness
      const checkVideoReady = () => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          setIsVideoReady(true);
        }
      };
      
      // Try playing immediately if video is ready
      if (video.readyState >= 2) {
        playVideo();
        checkVideoReady();
      }
      
      // Set up event listeners
      const handleCanPlay = () => {
        playVideo();
        checkVideoReady();
      };
      
      const handleLoadedMetadata = () => {
        playVideo();
        checkVideoReady();
      };
      
      const handleLoadedData = () => {
        checkVideoReady();
      };
      
      const handlePlaying = () => {
        checkVideoReady();
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadeddata', handleLoadedData);
      video.addEventListener('playing', handlePlaying);
      
      // Cleanup
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
        video.removeEventListener('playing', handlePlaying);
      };
    } else {
      setIsVideoReady(false);
    }
  }, [stream, mode]);

  // Cleanup camera stream on unmount or when mode changes away from camera
  useEffect(() => {
    return () => {
      if (stream && mode !== 'camera') {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream, mode]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setMode('camera'); // Set mode first to show loading state
      
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }
      
      // Try to get camera with better mobile support
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false,
      };
      
      // Try with ideal constraints first, fallback if needed
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Camera stream obtained successfully');
      } catch (err: any) {
        console.log('Trying fallback constraints...');
        // Fallback to simpler constraints
        constraints = {
          video: {
            facingMode: { ideal: 'environment' }
          },
          audio: false,
        };
        
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera stream obtained with fallback constraints');
        } catch (fallbackErr: any) {
          // Final fallback - any camera
          constraints = {
            video: true,
            audio: false,
          };
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Camera stream obtained with basic constraints');
        }
      }
      
      // Set the stream - this will trigger the useEffect to play the video
      setStream(mediaStream);
      
    } catch (err: any) {
      console.error('Camera access error:', err);
      let errorMessage = 'Unable to access camera. Please check permissions or use file upload.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please enable camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found. Please use file upload instead.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Camera is already in use by another application.';
      }
      
      setError(errorMessage);
      setMode('choose');
      
      // Clean up on error
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    setIsVideoReady(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !stream) {
      console.error('Cannot capture: video, canvas, or stream not available');
      setError('Camera not ready. Please wait a moment.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.error('Video not ready for capture', { 
        videoWidth: video.videoWidth, 
        videoHeight: video.videoHeight,
        readyState: video.readyState 
      });
      setError('Camera not ready. Please wait a moment and try again.');
      return;
    }
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        setError('Failed to capture image. Please try again.');
        return;
      }
      
      // Draw the current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      // Convert to File
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `food-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
          setCapturedFile(file);
          setCapturedImage(dataUrl);
          setIsVideoReady(false); // Reset ready state
          stopCamera();
          setMode('preview');
          console.log('Photo captured successfully');
        } else {
          console.error('Failed to create blob from canvas');
          setError('Failed to capture image. Please try again.');
        }
      }, 'image/jpeg', 0.9);
    } catch (err: any) {
      console.error('Capture error:', err);
      setError(`Failed to capture: ${err.message || 'Unknown error'}`);
    }
  }, [stopCamera, stream]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Please select an image (JPG, PNG, WebP) or PDF file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setCapturedFile(file);

    if (file.type === 'application/pdf') {
      setCapturedImage(null); // PDF doesn't have preview
      setMode('preview');
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (capturedFile && capturedImage) {
      onCapture(capturedFile, capturedImage);
    } else if (capturedFile) {
      // For PDFs without preview
      onCapture(capturedFile, '');
    }
  }, [capturedFile, capturedImage, onCapture]);

  const handleRetry = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setCapturedFile(null);
    setIsVideoReady(false);
    setMode('choose');
  }, [stopCamera]);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose();
  }, [stopCamera, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-lg overflow-y-auto">
      <GlassCard variant="green" className="w-full max-w-lg animate-scale-in my-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl text-foreground">
            {mode === 'choose' && 'Scan Food Label'}
            {mode === 'camera' && 'Take Photo'}
            {mode === 'preview' && 'Review Capture'}
          </h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-foreground/10 flex items-center justify-center hover:bg-foreground/20 transition-colors"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-secondary/20 border border-secondary/30">
            <p className="font-body text-sm text-secondary-foreground">{error}</p>
          </div>
        )}

        {/* Choose Mode */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="font-body text-muted-foreground text-center mb-6">
              Capture a food label to analyze its ingredients
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button
                onClick={startCamera}
                className={cn(
                  "flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl",
                  "bg-primary/10 border border-primary/30",
                  "hover:bg-primary/20 active:bg-primary/25 transition-all duration-300",
                  "group touch-manipulation"
                )}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <span className="font-body text-sm sm:text-base text-foreground">Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl",
                  "bg-foreground/5 border border-foreground/10",
                  "hover:bg-foreground/10 active:bg-foreground/15 transition-all duration-300",
                  "group touch-manipulation"
                )}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-foreground/10 flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-transform">
                  <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
                </div>
                <span className="font-body text-sm sm:text-base text-foreground">Upload</span>
              </button>
            </div>

            <p className="font-body text-muted-foreground/60 text-xs text-center mt-4">
              Supports JPG, PNG, WebP images and PDF documents
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden max-h-[60vh] sm:max-h-none">
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-muted">
                  <div className="text-center">
                    <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Starting camera...</p>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ 
                  display: stream ? 'block' : 'none',
                  minHeight: '100%',
                  backgroundColor: '#000'
                }}
              />
              {/* Scan overlay */}
              {stream && (
                <div className="absolute inset-2 sm:inset-4 border-2 border-primary/50 rounded-lg pointer-events-none z-10">
                  <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-primary" />
                  <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2 border-primary" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2 border-primary" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-primary" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <GlassButton
                variant="ghost"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={capturePhoto}
                disabled={!stream || !isVideoReady}
                className="flex-1"
              >
                <Camera className="w-4 h-4" />
                {isVideoReady ? 'Capture' : 'Loading...'}
              </GlassButton>
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Preview Mode */}
        {mode === 'preview' && (
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-muted rounded-xl overflow-hidden flex items-center justify-center max-h-[60vh] sm:max-h-none">
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured food label"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-2" />
                  <p className="font-body text-sm sm:text-base text-muted-foreground break-words px-2">
                    {capturedFile?.name}
                  </p>
                  <p className="font-body text-xs text-muted-foreground/60 mt-1">
                    PDF document ready for analysis
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <GlassButton
                variant="ghost"
                onClick={handleRetry}
                className="flex-1"
              >
                Retake
              </GlassButton>
              <GlassButton
                variant="primary"
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4" />
                Analyze
              </GlassButton>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
