# Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:3000
BASE_URL=http://localhost:3001
```

3. Start the server:
```bash
npm run dev  # Development mode with nodemon
# or
npm start    # Production mode
```

## API Documentation

See the main README.md for API endpoint documentation.

