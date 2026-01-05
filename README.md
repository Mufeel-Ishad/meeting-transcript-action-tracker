# Meeting Transcript to Action Tracker

A web application that converts meeting transcripts (text or audio) into structured action items with owners and tasks. The app uses Natural Language Processing (NLP) to extract action items and supports audio-to-text conversion for audio files.

## Features

- 📄 **Text File Upload**: Upload `.txt` files containing meeting transcripts
- 🎵 **Audio File Upload**: Upload audio files (`.mp3`, `.wav`, `.flac`, `.ogg`, `.m4a`) and convert them to text
- 🤖 **NLP Action Extraction**: Automatically extract action items, owners, and tasks from transcripts
- 📊 **Action Visualization**: Display extracted actions in a clean table format
- 📥 **Export**: Download action items as CSV or JSON
- 📧 **Email Sharing**: Share action items via email
- 🔗 **Link Sharing**: Generate shareable links for action items

## Tech Stack

### Backend
- **Node.js** with **Express** - Server framework
- **Multer** - File upload handling
- **AssemblyAI** - Audio-to-text conversion (Free tier: 5 hours/month)
- **Natural Language Processing** - Using `compromise` and `natural` libraries for action extraction
- **SendGrid** - Email functionality (Free tier: 100 emails/day)

### Frontend
- **Next.js** - React framework with server-side rendering
- **React** - UI library
- **Material-UI (MUI)** - Component library
- **TypeScript** - Type safety

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AssemblyAI account (for Speech-to-Text API - optional, free tier: 5 hours/month)
- SendGrid account (for email sharing - optional, free tier: 100 emails/day)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd meeting-transcript-action-tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=3001

# AssemblyAI API (optional, for audio-to-text conversion)
# Sign up at https://www.assemblyai.com/ and get your API key
# Free tier: 5 hours of transcription per month
ASSEMBLYAI_API_KEY=your-assemblyai-api-key

# SendGrid API (optional, for email sharing)
# Sign up at https://sendgrid.com/ and get your API key
# Free tier: 100 emails per day
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-verified-email@example.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Base URL for share links
BASE_URL=http://localhost:3001
```

**Note**: 
- Audio-to-text conversion requires AssemblyAI API key. If not configured, only text file uploads will work. Free tier includes 5 hours/month.
- Email sharing requires SendGrid API key. If not configured, only link sharing will work. Free tier includes 100 emails/day.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env.local` file in the `frontend` directory (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Running the Application

### Development Mode

1. **Start the backend server**:

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

2. **Start the frontend** (in a new terminal):

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the frontend**:

```bash
cd frontend
npm run build
npm start
```

2. **Start the backend**:

```bash
cd backend
npm start
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Upload a meeting transcript file (`.txt`) or an audio file (`.mp3`, `.wav`, etc.)
3. Wait for the processing to complete
4. View the extracted action items in the table
5. Download the results as CSV or JSON, or share them via email or link

## API Endpoints

### Upload and Process File
- **POST** `/api/upload` - Upload and process a transcript or audio file
  - Body: `multipart/form-data` with `file` field
  - Returns: `{ success, transcript, actions, actionCount }`

### Extract Actions from Text
- **POST** `/api/actions/extract` - Extract actions from provided text
  - Body: `{ text: string }`
  - Returns: `{ success, actions, actionCount }`

### Share Actions
- **POST** `/api/share/email` - Share actions via email
  - Body: `{ actions, recipients, subject, message }`
  - Returns: `{ success, message, recipients }`
  - Note: Limited to 100 emails/day (SendGrid free tier)

- **GET** `/api/share/email/quota` - Get email quota information
  - Returns: `{ available, limit, used, remaining, resetDate }`

- **POST** `/api/share/link` - Create a shareable link
  - Body: `{ actions }`
  - Returns: `{ success, shareId, shareLink }`

- **GET** `/api/share/:shareId` - Retrieve shared actions
  - Returns: `{ success, actions, createdAt }`

### Health Check
- **GET** `/api/health` - Check server status

## AssemblyAI Setup (Optional - Free Tier)

1. Sign up for a free account at [AssemblyAI](https://www.assemblyai.com/)
2. Navigate to your dashboard and copy your API key
3. Add the API key to your `.env` file as `ASSEMBLYAI_API_KEY`
4. **Free Tier Limits:**
   - 5 hours of transcription per month
   - Resets monthly
   - No credit card required

**Note:** Audio files are processed asynchronously. The API will upload your file, submit a transcription request, and poll for completion.

## SendGrid Setup (Optional - Free Tier)

1. Sign up for a free account at [SendGrid](https://sendgrid.com/)
2. Verify your sender email address (required for sending emails)
3. Go to Settings > API Keys and create a new API key
4. Copy the API key and add it to your `.env` file as `SENDGRID_API_KEY`
5. Set `SENDGRID_FROM_EMAIL` to your verified sender email
6. **Free Tier Limits:**
   - 100 emails per day
   - Resets daily at midnight UTC
   - No credit card required

**Note:** The system automatically tracks daily email usage and prevents sending if the limit is reached.

## Project Structure

```
meeting-transcript-action-tracker/
├── backend/
│   ├── routes/
│   │   ├── upload.js       # File upload and processing
│   │   ├── actions.js       # Action extraction
│   │   └── share.js         # Sharing functionality
│   ├── services/
│   │   ├── speechToText.js  # Audio-to-text conversion (AssemblyAI)
│   │   ├── emailService.js  # Email service (SendGrid)
│   │   └── actionExtractor.js # NLP action extraction
│   ├── uploads/             # Temporary file storage
│   ├── server.js            # Express server
│   └── package.json
├── frontend/
│   ├── components/
│   │   ├── FileUpload.tsx   # File upload component
│   │   ├── ActionTable.tsx  # Action display table
│   │   └── ShareDialog.tsx  # Share dialog
│   ├── pages/
│   │   ├── index.tsx        # Main page
│   │   └── _app.tsx         # App wrapper
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── package.json
└── README.md
```

## Limitations

- The NLP action extraction uses pattern matching and may not catch all action items. Results may vary based on transcript quality and format.
- Audio-to-text conversion requires AssemblyAI API key. Free tier is limited to 5 hours/month.
- Email sharing requires SendGrid API key. Free tier is limited to 100 emails/day.
- Share links are stored in memory and will be lost on server restart. For production, use a database.
- Daily email counter resets at midnight UTC. For production, use a database to track usage across server restarts.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

