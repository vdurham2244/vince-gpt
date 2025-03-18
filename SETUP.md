# Quick Setup Guide

This guide will help you quickly set up and run the 3D Talking Face Chatbot application with your DRACO-compressed GLB model, ElevenLabs voice synthesis, and OpenAI integration.

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- ElevenLabs API key (get one at https://elevenlabs.io)
- OpenAI API key (get one at https://platform.openai.com)

## First-Time Setup

1. Install all required dependencies:

```bash
npm install
```

This will install:
- three.js - for 3D rendering
- vite - for the development server
- elevenlabs-node - for voice synthesis

2. Make sure your `.glb` file is in the project root:

```
/vince3.glb
```

3. Configure API Keys:
   - Create a `.env` file in the project root
   - Add your API keys:
     ```
     VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
     VITE_ELEVENLABS_VOICE_ID=your_voice_id_here
     VITE_OPENAI_API_KEY=your_openai_api_key_here
     ```

4. Configure ElevenLabs:
   - Sign up for an account at https://elevenlabs.io
   - Get your API key from the ElevenLabs dashboard (Profile > API Key)
   - Create a voice in the ElevenLabs dashboard:
     1. Go to Voice Library
     2. Click "Add Voice"
     3. Choose "Instant Voice Cloning"
     4. Upload a clear audio sample of your voice (at least 1 minute)
     5. Name your voice and save
     6. Copy the Voice ID from the voice details page

5. Configure OpenAI:
   - Sign up for an account at https://platform.openai.com
   - Get your API key from the OpenAI dashboard
   - The default model is set to 'gpt-3.5-turbo', but you can change it in `openai-handler.js`

6. Customize the System Prompt:
   - Open `main.js`
   - Find the `initialSystemPrompt` variable
   - Modify it to give your chatbot specific instructions or personality
   - Example:
     ```javascript
     const initialSystemPrompt = `You are a helpful and friendly AI assistant. Keep your responses concise and natural, as they will be spoken out loud. 
     Try to maintain a conversational tone and avoid using complex language or technical terms unless specifically asked.`;
     ```

7. Test the setup:
   - Start the application with `npm start`
   - Try sending a message in the chat interface
   - The face should animate while speaking with your voice
   - Check the browser console for any errors

## Running the Application

Start the development server:

```bash
npm start
```

This will automatically open your default browser to `http://localhost:5173`

## OpenAI Integration

The application uses OpenAI's chat completion API for generating responses. You can:

1. Change the model in `openai-handler.js`:
   ```javascript
   model: 'gpt-3.5-turbo', // Change to your preferred model
   ```

2. Adjust the response parameters:
   ```javascript
   temperature: 0.7, // Controls randomness (0.0 to 1.0)
   max_tokens: 150  // Maximum length of response
   ```

3. Modify the system prompt at any time:
   ```javascript
   responseHandler.setSystemPrompt('Your new system prompt here');
   ```

4. Clear conversation history:
   ```javascript
   responseHandler.clearHistory();
   ```

## DRACO Compression Information

The application uses Google's CDN to load the DRACO decoder files:

```javascript
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
```

This ensures that the DRACO compressed GLB model loads correctly without needing to handle the decoder files locally.

## Troubleshooting Common Issues

If you encounter issues with the model loading:

1. Check the browser console for specific errors

2. Make sure the path to your GLB file is correct in the `main.js` file:
   ```javascript
   loader.load('/vince3.glb', ...
   ```

3. Verify that your model is actually DRACO compressed. If it's not, you can modify the loader code in `main.js` to not use the DRACO loader.

4. If you're on a network that blocks Google's CDN, you may need to modify the code to use a different CDN or host the decoder files locally.

For API-related issues:

1. Verify all API keys are correct in the `.env` file
2. Check that your ElevenLabs account has sufficient credits
3. Ensure your OpenAI account has sufficient credits
4. Check the browser console for any API-related errors
5. Make sure your voice sample is clear and of sufficient length
6. Verify that your network connection is stable

## Building for Production

To build the application for production deployment:

```bash
npm run build
```

This will create a `dist` directory with all the optimized files.

To preview the production build locally:

```bash
npm run serve
``` 