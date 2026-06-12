"use client";

import React, { useEffect, useRef, useState } from "react";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExportProgressProps {
  videoSrc: string;
  crop: CropRect;
  startTime: number;
  endTime: number;
  videoDims: { width: number; height: number };
  includeAudio: boolean;
  exportFormat: "mp4" | "webm";
  onCancel: () => void;
  onComplete: (blob: Blob, mimeType: string) => void;
}

export default function ExportProgress({
  videoSrc,
  crop,
  startTime,
  endTime,
  videoDims,
  includeAudio,
  exportFormat,
  onCancel,
  onComplete,
}: ExportProgressProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing renderer...");
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Output Dimensions
  const outWidth = Math.round((crop.width / 100) * videoDims.width);
  const outHeight = Math.round((crop.height / 100) * videoDims.height);

  useEffect(() => {
    let active = true;
    let chunks: Blob[] = [];

    const startRecording = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        setStatus("Setting up audio nodes...");

        let audioTrack: MediaStreamTrack | null = null;

        if (includeAudio) {
          try {
            // Check if audio exists in video before setting up WebAudio
            // We use a temporary stream capture to probe audio tracks
            const probeStream = (video as any).captureStream ? (video as any).captureStream() : ((video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null);
            
            if (probeStream && probeStream.getAudioTracks().length > 0) {
              const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
              const audioCtx = new AudioContextClass();
              audioCtxRef.current = audioCtx;

              // Create nodes
              const sourceNode = audioCtx.createMediaElementSource(video);
              sourceNodeRef.current = sourceNode;
              
              const destNode = audioCtx.createMediaStreamDestination();
              
              // Connect source to destination node
              sourceNode.connect(destNode);
              
              audioTrack = destNode.stream.getAudioTracks()[0];
            }
          } catch (err) {
            console.warn("Could not extract audio stream from video element:", err);
          }
        }

        setStatus("Configuring MediaRecorder...");

        // Combine canvas stream + audio track
        const fps = 30;
        const canvasStream = canvas.captureStream(fps);
        const videoTrack = canvasStream.getVideoTracks()[0];

        const tracks: MediaStreamTrack[] = [videoTrack];
        if (audioTrack) {
          tracks.push(audioTrack);
        }

        const outputStream = new MediaStream(tracks);

        // Select mimeType based on format preference
        const preferredMimeTypes = exportFormat === "mp4"
          ? ["video/mp4;codecs=h264,aac", "video/mp4;codecs=h264", "video/mp4"]
          : ["video/webm;codecs=h264,opus", "video/webm;codecs=vp9,opus", "video/webm"];

        let selectedMimeType = "";
        for (const type of preferredMimeTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            selectedMimeType = type;
            break;
          }
        }

        // If preferred is not supported, try the fallback format
        if (!selectedMimeType) {
          const fallbackMimeTypes = exportFormat === "mp4"
            ? ["video/webm;codecs=h264,opus", "video/webm;codecs=vp9,opus", "video/webm"]
            : ["video/mp4;codecs=h264,aac", "video/mp4;codecs=h264", "video/mp4"];

          for (const type of fallbackMimeTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
              selectedMimeType = type;
              setStatus(`MP4 unsupported on this browser. Encoding as WebM...`);
              break;
            }
          }
        }

        if (!selectedMimeType) {
          selectedMimeType = "video/webm"; // Ultimate fallback
        }

        const options = {
          mimeType: selectedMimeType,
          videoBitsPerSecond: 2500000, // 2.5 Mbps target
        };

        const recorder = new MediaRecorder(outputStream, options);
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (!active) return;
          setStatus("Compiling video files...");
          const finalBlob = new Blob(chunks, { type: selectedMimeType });
          onComplete(finalBlob, selectedMimeType);
        };

        // Prepare video playback seek
        video.currentTime = startTime;

        const onSeeked = () => {
          if (!active) return;
          video.removeEventListener("seeked", onSeeked);

          setStatus("Rendering and recording frames...");
          
          recorder.start();
          video.play().catch((err) => {
            setError("Playback failed. Please ensure the window remains focused.");
            console.error("Playback start error:", err);
          });

          const drawLoop = () => {
            if (!active) return;

            if (video.currentTime >= endTime || video.ended) {
              video.pause();
              if (recorder.state !== "inactive") {
                recorder.stop();
              }
              cleanupAudio();
              return;
            }

            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              const sx = (crop.x / 100) * video.videoWidth;
              const sy = (crop.y / 100) * video.videoHeight;
              const sWidth = (crop.width / 100) * video.videoWidth;
              const sHeight = (crop.height / 100) * video.videoHeight;

              ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
            }

            // Update progress
            const duration = endTime - startTime;
            const elapsed = video.currentTime - startTime;
            const pct = Math.min(99.9, Math.max(0, (elapsed / duration) * 100));
            setProgress(pct);

            animationFrameRef.current = requestAnimationFrame(drawLoop);
          };

          animationFrameRef.current = requestAnimationFrame(drawLoop);
        };

        video.addEventListener("seeked", onSeeked);
      } catch (err: any) {
        console.error("Render initiation error:", err);
        setError(err.message || "Unknown error during rendering preparation.");
      }
    };

    // Delay initialization slightly to let UI render completely
    const timer = setTimeout(() => {
      startRecording();
    }, 1000);

    return () => {
      active = false;
      clearTimeout(timer);
      
      // Stop recorder
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }

      // Stop animation frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      cleanupAudio();
    };
  }, []);

  const cleanupAudio = () => {
    try {
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
    } catch (e) {
      console.warn("Cleanup audio error:", e);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-medium text-ink">Exporting Video</h2>
        <p className="text-sm text-mute leading-relaxed">
          Please keep this tab focused and active. Moving away or backgrounding the tab will throttle rendering.
        </p>
      </div>

      <div className="bg-surface border border-hairline p-6 rounded-lg flex flex-col items-center gap-6">
        {/* Real-time Render Preview Canvas */}
        <div className="relative border border-hairline bg-canvas rounded-sm overflow-hidden flex items-center justify-center max-w-full">
          <canvas
            ref={canvasRef}
            width={outWidth}
            height={outHeight}
            className="max-h-[260px] max-w-full object-contain block"
          />
          
          {/* Invisible background video used for cropping */}
          <video
            ref={videoRef}
            src={videoSrc}
            className="hidden"
            muted
            playsInline
          />
        </div>

        {/* Progress Ring / Progress bar */}
        <div className="w-full">
          <div className="flex items-center justify-between text-xs text-mute mb-2">
            <span className="font-mono text-accent-blue font-medium">{status}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-hairline">
            <div
              className="h-full bg-accent-blue transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Technical Specs Summary Card */}
        <div className="w-full grid grid-cols-2 gap-4 bg-surface-card border border-hairline p-4 rounded text-xs text-mute font-mono">
          <div>
            <span className="block text-stone mb-0.5">Resolution</span>
            <span className="text-ink">{outWidth} × {outHeight} px</span>
          </div>
          <div>
            <span className="block text-stone mb-0.5">Duration</span>
            <span className="text-ink">{(endTime - startTime).toFixed(2)}s</span>
          </div>
        </div>

        {error && (
          <div className="w-full py-2 px-3 rounded bg-accent-red-soft text-accent-red border border-accent-red/20 text-xs font-medium">
            Error: {error}
          </div>
        )}

        {/* Cancel CTA */}
        <div className="flex w-full justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 bg-surface-elevated border border-hairline hover:bg-surface-card hover:border-stone text-xs font-medium text-ink rounded-md transition-colors"
          >
            Cancel Export
          </button>
        </div>
      </div>
    </div>
  );
}
