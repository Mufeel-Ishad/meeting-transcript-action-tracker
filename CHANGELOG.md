# Changelog

## [Updated] - Free Tier Services Migration

### Changed
- **Speech-to-Text Service**: Migrated from Google Cloud Speech-to-Text to AssemblyAI
  - Free tier: 5 hours of transcription per month
  - Simpler API key authentication (no service account files needed)
  - Async upload and polling pattern for transcription

- **Email Service**: Migrated from Nodemailer/SMTP to SendGrid
  - Free tier: 100 emails per day
  - Built-in daily quota tracking
  - Simpler API key authentication
  - New quota endpoint: `GET /api/share/email/quota`

### Added
- `backend/services/emailService.js` - New SendGrid email service with quota tracking
- `GET /api/share/email/quota` - Endpoint to check email quota status
- Daily email counter that resets at midnight UTC
- Automatic quota validation before sending emails

### Removed
- `@google-cloud/speech` package dependency
- `nodemailer` package dependency
- Google Cloud service account authentication
- SMTP email configuration

### Updated Files
- `backend/services/speechToText.js` - Complete rewrite for AssemblyAI
- `backend/services/emailService.js` - New file for SendGrid integration
- `backend/routes/share.js` - Updated to use emailService
- `backend/routes/upload.js` - Updated error messages for AssemblyAI
- `backend/package.json` - Updated dependencies
- `README.md` - Updated documentation
- `SETUP.md` - Updated setup instructions
- `PROJECT_SUMMARY.md` - Updated project summary
- `MIGRATION_NOTES.md` - New migration guide

### Environment Variables Changed

**Removed:**
- `GOOGLE_APPLICATION_CREDENTIALS`
- `EMAIL_HOST`
- `EMAIL_PORT`
- `EMAIL_USER`
- `EMAIL_PASS`
- `EMAIL_FROM`

**Added:**
- `ASSEMBLYAI_API_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

### Breaking Changes
- All environment variables for email and speech-to-text have changed
- Must run `npm install` to update dependencies
- Email quota tracking is now enforced (100 emails/day limit)

### Migration Required
See `MIGRATION_NOTES.md` for detailed migration instructions.

