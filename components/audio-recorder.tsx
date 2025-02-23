"use client"

import * as React from "react"
import { Mic, Square, Play, Pause, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = React.useState(false)
  const [audioURL, setAudioURL] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const chunksRef = React.useRef<Blob[]>([])

  // Check if browser supports audio recording
  const checkAudioSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser doesn't support audio recording")
      return false
    }
    return true
  }

  const startRecording = async () => {
    try {
      setError(null)

      if (!checkAudioSupport()) return

      // Request permission and get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      })

      // Create and configure MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/ogg",
      })

      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType,
        })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)
        onRecordingComplete(audioBlob)
        chunksRef.current = []
      }

      recorder.onerror = (e) => {
        setError("Recording failed: " + e.error.message)
        setIsRecording(false)
      }

      recorder.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Error accessing microphone:", err)
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError("Microphone access was denied. Please allow microphone access and try again.")
      } else if (err instanceof DOMException && err.name === "NotFoundError") {
        setError("No microphone was found. Please connect a microphone and try again.")
      } else {
        setError("Failed to start recording. Please try again.")
      }
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
        setIsRecording(false)
      } catch (err) {
        console.error("Error stopping recording:", err)
        setError("Failed to stop recording. Please try again.")
        setIsRecording(false)
      }
    }
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioURL) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((err) => {
          console.error("Error playing audio:", err)
          setError("Failed to play audio. Please try again.")
        })
      }
      setIsPlaying(!isPlaying)
    } catch (err) {
      console.error("Error toggling playback:", err)
      setError("Failed to play audio. Please try again.")
    }
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL)
      }
    }
  }, [audioURL, isRecording])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false)
    }
  }, [])

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        {isRecording ? (
          <Button variant="destructive" size="icon" onClick={stopRecording} className="h-8 w-8">
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            onClick={startRecording}
            className="h-8 w-8"
            disabled={!!error && !error.includes("denied")}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}

        {audioURL && (
          <>
            <audio ref={audioRef} src={audioURL} />
            <Button variant="secondary" size="icon" onClick={togglePlayback} className="h-8 w-8">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
              <div
                className="h-full bg-primary/20 transition-all duration-200"
                style={{
                  width:
                    audioRef.current && !audioRef.current.paused
                      ? `${(audioRef.current.currentTime / audioRef.current.duration) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

