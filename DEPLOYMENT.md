# Deployment Guide - Google Cloud Run

## Prerequisites

- Google Cloud SDK installed and configured
- Docker installed (for local testing)
- Project set up in Google Cloud Console

## Step 1: Prepare for Deployment

### 1.1 Build Frontend

```bash
cd client
npm run build
cd ..
```

This creates a `client/dist` folder with production build.

### 1.2 Update Server to Serve Static Files

The server should serve the React build in production. Update `server/index.js`:

```javascript
// Serve static files from React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}
```

## Step 2: Create Dockerfile

Create `Dockerfile` in root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install && cd ..

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build && cd ..

# Expose port
EXPOSE 8080

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Start server
CMD ["node", "server/index.js"]
```

## Step 3: Create .dockerignore

```
node_modules
client/node_modules
.env
.env.local
.git
.gitignore
logs
uploads
*.log
.DS_Store
```

## Step 4: Deploy to Cloud Run

### 4.1 Using gcloud CLI

```bash
# Build and deploy
gcloud run deploy outfit-vision \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "NODE_ENV=production,GOOGLE_CLIENT_ID=your_id,GOOGLE_CLIENT_SECRET=your_secret,GOOGLE_VISION_API_KEY=your_key,GOOGLE_GEMINI_API_KEY=your_key,GOOGLE_PROJECT_ID=your_project,FIRESTORE_DATABASE_ID=(default),SESSION_SECRET=your_secret,CLIENT_URL=https://your-app-url.run.app"
```

### 4.2 Using Cloud Console

1. Go to Cloud Run in Google Cloud Console
2. Click "Create Service"
3. Choose "Deploy one revision from a source repository"
4. Select your source
5. Configure:
   - Service name: `outfit-vision`
   - Region: Choose closest region
   - Authentication: Allow unauthenticated invocations
6. Add environment variables
7. Deploy

## Step 5: Update OAuth Redirect URI

1. Go to Google Cloud Console > APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add authorized redirect URI: `https://your-app-url.run.app/api/auth/google/callback`
4. Save

## Step 6: Update Environment Variables

Set these in Cloud Run:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (must match Cloud Run URL)
- `GOOGLE_VISION_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `GOOGLE_PROJECT_ID`
- `FIRESTORE_DATABASE_ID`
- `SESSION_SECRET`
- `CLIENT_URL` (your Cloud Run URL)
- `NODE_ENV=production`
- `PORT=8080`

## Step 7: Configure Firestore

Ensure Firestore is accessible from Cloud Run:
- Firestore should be in the same project
- No additional IAM configuration needed if using same project

## Step 8: Test Deployment

1. Visit your Cloud Run URL
2. Test OAuth flow
3. Test photo upload
4. Test analysis
5. Check logs in Cloud Run console

## Monitoring

- View logs: Cloud Run > Logs tab
- Monitor performance: Cloud Run > Metrics
- Check API usage: APIs & Services > Dashboard

## Troubleshooting

### Build Failures
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs in Cloud Run

### Runtime Errors
- Check environment variables are set
- Verify API keys are valid
- Check Firestore permissions
- Review application logs

### OAuth Issues
- Verify redirect URI matches exactly
- Check OAuth consent screen configuration
- Ensure Google Photos API is enabled

## Cost Optimization

- Set minimum instances to 0 (scale to zero)
- Configure request timeout appropriately
- Monitor API usage (Vision, Gemini)
- Set up billing alerts

## Security Considerations

- Never commit `.env` files
- Use Secret Manager for sensitive data
- Enable HTTPS only
- Set up proper CORS
- Use environment-specific API keys
- Enable Cloud Armor for DDoS protection (optional)

