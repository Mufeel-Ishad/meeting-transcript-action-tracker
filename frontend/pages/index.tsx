import { useState } from 'react'
import Head from 'next/head'
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import FileUpload from '../components/FileUpload'
import ActionTable from '../components/ActionTable'
import ShareDialog from '../components/ShareDialog'
import { ActionItem } from '../types'

export default function Home() {
  const [actions, setActions] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)

  const handleFileUpload = async (file: File) => {
    setLoading(true)
    setError(null)
    setActions([])

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process file')
      }

      const data = await response.json()
      setActions(data.actions || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the file')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (format: 'csv' | 'json') => {
    if (actions.length === 0) return

    if (format === 'csv') {
      const headers = ['Owner', 'Task']
      const rows = actions.map(action => [
        action.owner || 'Unassigned',
        action.task || ''
      ])
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'action-items.csv'
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const jsonContent = JSON.stringify(actions, null, 2)
      const blob = new Blob([jsonContent], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'action-items.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <>
      <Head>
        <title>Meeting Transcript to Action Tracker</title>
        <meta name="description" content="Convert meeting transcripts into actionable task lists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Meeting Transcript to Action Tracker
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload a meeting transcript or audio file to extract action items
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <FileUpload onFileUpload={handleFileUpload} disabled={loading} />
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
              Processing file...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {actions.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Extracted Action Items ({actions.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => handleDownload('csv')}
                  size="small"
                >
                  Download CSV
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleDownload('json')}
                  size="small"
                >
                  Download JSON
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShareDialogOpen(true)}
                  size="small"
                >
                  Share
                </Button>
              </Box>
            </Box>
            <ActionTable actions={actions} />
          </Paper>
        )}

        <ShareDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          actions={actions}
        />
      </Container>
    </>
  )
}

