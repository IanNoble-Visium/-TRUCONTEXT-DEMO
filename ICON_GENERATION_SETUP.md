# Icon Generation Setup Guide

## Issues Fixed

### 1. SVG Icon Loading Failures
- **Issue**: SVG icons were failing to load with `net::ERR_CACHE_READ_FAILURE` errors
- **Cause**: Browser cache issues with SVG files
- **Solution**: The SVG files exist in `/public/icons-svg/` directory. Cache errors are typically browser-related and should resolve on refresh.

### 2. API Generation Error (500 Server Error)
- **Issue**: `/api/icons/generate` endpoint returning 500 error
- **Cause**: Missing Google API key configuration
- **Solution**: Set up Google API key as described below

## Google API Key Setup

To enable AI-powered icon generation, you need to configure a Google API key:

### Step 1: Get Google API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables
1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Google API key:
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

### Step 3: Restart Development Server
After adding the API key, restart your development server:
```bash
npm run dev
```

## Fallback Behavior

If no Google API key is configured:
- The system will generate placeholder SVG icons instead of AI-generated ones
- Users will see a more informative error message
- The application will continue to function normally

## Testing Icon Generation

1. Navigate to Icon Management view
2. Click the "+Generate" button
3. Fill in:
   - **Node Type**: e.g., "firewall", "database", "server"
   - **Description**: e.g., "A modern firewall icon with shield design"
4. Click "Generate"

## Error Messages

The system now provides specific error messages:
- **Missing API Key**: "AI generation requires Google API key. Using placeholder icon instead."
- **Quota Exceeded**: "AI service quota exceeded. Please try again later."
- **Server Errors**: Detailed server error information
- **Network Errors**: Connection-related error details

## Troubleshooting

### SVG Loading Issues
- Clear browser cache and refresh
- Check browser developer tools for specific error details
- Verify files exist in `/public/icons-svg/` directory

### API Generation Issues
- Verify Google API key is correctly set in `.env.local`
- Check API key has proper permissions for Gemini API
- Monitor API quota usage in Google Cloud Console
- Check server logs for detailed error information

### Cache Issues
- Try hard refresh (Ctrl+F5 or Cmd+Shift+R)
- Clear browser cache completely
- Try in incognito/private browsing mode
