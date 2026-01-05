# Quick Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- (Optional) AssemblyAI account for audio-to-text (Free tier: 5 hours/month)
- (Optional) SendGrid account for email sharing (Free tier: 100 emails/day)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Backend Environment

Create a `.env` file in the `backend` directory:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:3001
```

**Optional - For Audio-to-Text (AssemblyAI Free Tier):**
1. Sign up for a free account at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add to `.env`:
```env
ASSEMBLYAI_API_KEY=your-assemblyai-api-key
```

**Note:** AssemblyAI free tier includes 5 hours of transcription per month.

**Optional - For Email Sharing (SendGrid Free Tier):**
1. Sign up for a free account at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address
3. Get your API key from Settings > API Keys
4. Add to `.env`:
```env
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

**Note:** SendGrid free tier includes 100 emails per day.

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. (Optional) Configure Frontend Environment

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Open the Application

Navigate to `http://localhost:3000` in your browser.

## Testing

1. Use the provided `SAMPLE_TRANSCRIPT.txt` file to test text file upload
2. Upload it through the web interface
3. Verify that action items are extracted and displayed

## Free Tier Limits

### AssemblyAI (Audio-to-Text)
- **Limit:** 5 hours of transcription per month
- **Reset:** Monthly
- **Note:** Audio files are processed asynchronously. Longer files may take more time.

### SendGrid (Email Sharing)
- **Limit:** 100 emails per day
- **Reset:** Daily at midnight (UTC)
- **Note:** The system tracks daily usage and will prevent sending if the limit is reached.

## Troubleshooting

### Backend won't start
- Check that port 3001 is not in use
- Verify all dependencies are installed: `npm install`
- Check `.env` file exists and has correct values

### Frontend won't start
- Check that port 3000 is not in use
- Verify all dependencies are installed: `npm install`
- Check that backend is running on port 3001

### Audio files not working
- Verify AssemblyAI API key is set correctly in `.env`
- Check that `ASSEMBLYAI_API_KEY` is valid
- Ensure you haven't exceeded the 5-hour monthly limit
- Check AssemblyAI dashboard for API status

### Email sharing not working
- Verify SendGrid API key is set correctly in `.env`
- Check that `SENDGRID_FROM_EMAIL` is a verified sender in SendGrid
- Ensure you haven't exceeded the 100 emails/day limit
- Check SendGrid dashboard for delivery status
- Verify recipient email addresses are valid

### Email quota exceeded
- The system tracks daily email usage
- Wait until the next day (UTC midnight) for the quota to reset
- Check quota status via API endpoint: `GET /api/share/email/quota`
