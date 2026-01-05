import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EmailIcon from '@mui/icons-material/Email'
import LinkIcon from '@mui/icons-material/Link'
import { ActionItem } from '../types'

interface ShareDialogProps {
  open: boolean
  onClose: () => void
  actions: ActionItem[]
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`share-tabpanel-${index}`}
      aria-labelledby={`share-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ShareDialog({ open, onClose, actions }: ShareDialogProps) {
  const [tabValue, setTabValue] = useState(0)
  const [emailRecipients, setEmailRecipients] = useState('')
  const [emailSubject, setEmailSubject] = useState('Meeting Action Items')
  const [emailMessage, setEmailMessage] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    setError(null)
    setSuccess(null)
  }

  const handleEmailShare = async () => {
    if (!emailRecipients.trim()) {
      setError('Please enter at least one recipient email')
      return
    }

    const recipients = emailRecipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    if (recipients.length === 0) {
      setError('Please enter at least one valid email address')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/share/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actions,
          recipients,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send email')
      }

      setSuccess(`Email sent successfully to ${recipients.length} recipient(s)`)
      setTimeout(() => {
        onClose()
        setEmailRecipients('')
        setEmailSubject('Meeting Action Items')
        setEmailMessage('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the email')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkShare = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/share/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ actions }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create share link')
      }

      const data = await response.json()
      setShareLink(data.shareLink)
      setSuccess('Share link created successfully!')
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the share link')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setSuccess('Link copied to clipboard!')
  }

  const handleClose = () => {
    onClose()
    setTabValue(0)
    setEmailRecipients('')
    setEmailSubject('Meeting Action Items')
    setEmailMessage('')
    setShareLink('')
    setError(null)
    setSuccess(null)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share Action Items</DialogTitle>
      <DialogContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<EmailIcon />} iconPosition="start" label="Email" />
            <Tab icon={<LinkIcon />} iconPosition="start" label="Link" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            label="Recipients (comma-separated)"
            value={emailRecipients}
            onChange={(e) => setEmailRecipients(e.target.value)}
            placeholder="email1@example.com, email2@example.com"
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Subject"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Message (optional)"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleEmailShare}
              disabled={loading || !emailRecipients.trim()}
              fullWidth
            >
              {loading ? 'Sending...' : 'Send Email'}
            </Button>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {!shareLink ? (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a shareable link that others can use to view these action items.
              </Typography>
              <Button
                variant="contained"
                onClick={handleLinkShare}
                disabled={loading}
                fullWidth
              >
                {loading ? 'Creating Link...' : 'Create Share Link'}
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField
                fullWidth
                label="Share Link"
                value={shareLink}
                margin="normal"
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCopyLink} edge="end">
                        <ContentCopyIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Share this link with others to view the action items.
              </Typography>
            </Box>
          )}
        </TabPanel>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

