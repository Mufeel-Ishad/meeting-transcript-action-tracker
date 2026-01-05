import { useState, useRef } from 'react'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import AudioFileIcon from '@mui/icons-material/AudioFile'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  disabled?: boolean
}

export default function FileUpload({ onFileUpload, disabled = false }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'text/plain',
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/x-wav',
      'audio/flac',
      'audio/ogg',
      'audio/m4a',
    ]
    const allowedExts = ['.txt', '.mp3', '.wav', '.flac', '.ogg', '.m4a']
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()

    if (
      allowedTypes.includes(file.type) ||
      allowedExts.includes(ext) ||
      file.type === 'application/octet-stream'
    ) {
      setSelectedFile(file)
      onFileUpload(file)
    } else {
      alert('Invalid file type. Please upload a text file (.txt) or audio file (.mp3, .wav, .flac, .ogg, .m4a)')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const isAudioFile = (fileName: string) => {
    const audioExts = ['.mp3', '.wav', '.flac', '.ogg', '.m4a']
    const ext = '.' + fileName.split('.').pop()?.toLowerCase()
    return audioExts.includes(ext)
  }

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.mp3,.wav,.flac,.ogg,.m4a,audio/*,text/plain"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          transition: 'all 0.3s ease',
        }}
        onClick={!disabled ? handleClick : undefined}
      >
        <CloudUploadIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drag and drop a file here, or click to select
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Supported formats: Text files (.txt) or Audio files (.mp3, .wav, .flac, .ogg, .m4a)
        </Typography>
        <Button
          variant="contained"
          component="span"
          disabled={disabled}
          sx={{ mt: 2 }}
        >
          Select File
        </Button>
      </Paper>

      {selectedFile && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAudioFile(selectedFile.name) ? (
              <AudioFileIcon />
            ) : (
              <DescriptionIcon />
            )}
            <Typography variant="body2">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </Typography>
          </Box>
        </Alert>
      )}
    </Box>
  )
}

