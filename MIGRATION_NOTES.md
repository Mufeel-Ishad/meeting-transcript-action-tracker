# Migration Notes: Free Tier Services

This document outlines the changes made to migrate from paid services to free-tier alternatives.

## Changes Made

### 1. Speech-to-Text: Google Cloud → AssemblyAI

**Previous:**
- Google Cloud Speech-to-Text API
- Required service account JSON key file
- Pay-as-you-go pricing

**New:**
- AssemblyAI API
- Simple API key authentication
- Free tier: 5 hours of transcription per month

**Migration Steps:**
1. Sign up at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Replace `GOOGLE_APPLICATION_CREDENTIALS` with `ASSEMBLYAI_API_KEY` in `.env`
4. Remove `@google-cloud/speech` from package.json (already done)
5. Install dependencies: `npm install`

**Code Changes:**
- `backend/services/speechToText.js` - Completely rewritten to use AssemblyAI API
- Uses async upload → submit → poll pattern
- No longer requires file encoding detection

### 2. Email Service: Nodemailer/SMTP → SendGrid

**Previous:**
- Nodemailer with SMTP (Gmail, etc.)
- Required SMTP credentials (host, port, user, password)
- No built-in rate limiting

**New:**
- SendGrid API
- Simple API key authentication
- Free tier: 100 emails per day
- Built-in daily quota tracking

**Migration Steps:**
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address
3. Create an API key in Settings > API Keys
4. Replace email environment variables:
   - Remove: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
   - Add: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
5. Remove `nodemailer` from package.json (already done)
6. Install dependencies: `npm install`

**Code Changes:**
- `backend/services/emailService.js` - New service with SendGrid integration
- `backend/routes/share.js` - Updated to use emailService
- Added daily quota tracking (resets at midnight UTC)
- Added quota endpoint: `GET /api/share/email/quota`

## Environment Variables

### Old Configuration
```env
# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

### New Configuration
```env
# AssemblyAI
ASSEMBLYAI_API_KEY=your-assemblyai-api-key

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-email@example.com
```

## Free Tier Limits

### AssemblyAI
- **Limit:** 5 hours of transcription per month
- **Reset:** Monthly
- **Tracking:** Not implemented (check AssemblyAI dashboard)

### SendGrid
- **Limit:** 100 emails per day
- **Reset:** Daily at midnight UTC
- **Tracking:** Implemented in `emailService.js`
- **Endpoint:** `GET /api/share/email/quota` to check remaining quota

## Benefits of Migration

1. **No Credit Card Required:** Both services offer free tiers without requiring payment information
2. **Simpler Setup:** API keys instead of complex credential files
3. **Better Rate Limiting:** SendGrid quota tracking prevents exceeding limits
4. **Cost Effective:** Free tiers are sufficient for development and small-scale usage

## Breaking Changes

1. **Environment Variables:** All email and speech-to-text environment variables have changed
2. **API Behavior:** 
   - Audio transcription now uses async polling (may take longer for large files)
   - Email sending includes quota checks and may fail if daily limit is reached
3. **Dependencies:** Must run `npm install` to get new packages and remove old ones

## Testing After Migration

1. **Audio-to-Text:**
   - Upload a small audio file
   - Verify transcription completes successfully
   - Check AssemblyAI dashboard for usage

2. **Email Sharing:**
   - Send a test email
   - Verify email is received
   - Check quota endpoint: `GET /api/share/email/quota`
   - Verify quota tracking works correctly

## Production Considerations

1. **Database for Quota Tracking:** Current implementation uses in-memory storage. For production, use a database to persist quota across server restarts.

2. **Error Handling:** Both services may have different error responses. Ensure proper error handling for:
   - AssemblyAI: API rate limits, file size limits, transcription failures
   - SendGrid: Daily quota exceeded, invalid API key, unverified sender

3. **Monitoring:** Set up monitoring for:
   - AssemblyAI monthly usage (5 hours)
   - SendGrid daily usage (100 emails)
   - API errors and failures

4. **Upgrade Path:** If limits are exceeded:
   - AssemblyAI: Upgrade to paid plan for more transcription hours
   - SendGrid: Upgrade to Essentials plan for 40,000 emails/month

