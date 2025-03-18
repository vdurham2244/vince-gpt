# 3D Talking Face Chatbot

This project creates a web-based chatbot with a 3D animated face model that simulates talking. The application uses the FACS (Facial Action Coding System) to animate the face model realistically.

## Features

- 3D face model animation using FACS (Facial Action Coding System)
- Realistic talking animation with natural mouth movements
- Simple chat interface
- Random blinking and subtle facial movements for lifelike appearance
- Support for DRACO compressed GLB models

## Requirements

- Your .glb 3D face model with FACS morph targets (already included in the project)
- Modern web browser with WebGL support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:5173`

## How It Works

The application uses Three.js to load and render your 3D face model. The FACS animation system identifies the available morph targets in your model and applies realistic talking animations by:

1. Detecting all available FACS morph targets in your model
2. Generating natural talking patterns that combine different mouth shapes
3. Applying these patterns when the chatbot is "speaking"
4. Adding subtle facial movements like blinking to make the face appear more lifelike

The chat interface allows you to type messages, which will trigger the talking animation.

## DRACO Compression

This application supports DRACO compressed GLB files, which significantly reduce file size for faster loading. The DRACO decoder is loaded either from local files (copied during build) or from Google's CDN as a fallback.

If you need to convert your model to use DRACO compression, you can use tools like:
- [gltfpack](https://github.com/zeux/meshoptimizer/tree/master/gltf)
- [glTF Pipeline](https://github.com/CesiumGS/gltf-pipeline)
- Blender's GLB export with DRACO compression option

## Customization

- `main.js`: Main application logic and 3D scene setup
- `facs-animation.js`: FACS animation system and talking patterns
- `index.html`: HTML structure and UI elements
- `vite.config.js`: Configuration for DRACO decoder files

## Testing

Click the "Test Talking" button in the top right corner to test the talking animation without typing in the chat. The application will also automatically test the talking animation shortly after the model loads.

## Notes on the 3D Model

The application expects your .glb file to include morph targets following FACS naming conventions. The model should have morph targets for various facial expressions, especially mouth shapes for talking animations.

Common morph target names that the system will look for include:
- jawOpen
- mouthOpen
- mouthSmile_L, mouthSmile_R
- mouthPucker
- mouthFunnel
- etc.

If your model uses different naming conventions, you may need to adjust the mapping in the `facs-animation.js` file.

## Integration with a Real Chatbot Backend

To integrate with a real chatbot backend:

1. Modify the `handleChatMessage` function in `main.js` to send the message to your backend
2. When receiving a response, call the `startTalking` function with a duration matching the audio response
3. Add audio playback synchronized with the facial animation

## Troubleshooting

If the talking animation doesn't work:
- Check the browser console for errors
- Verify that your 3D model contains the expected FACS morph targets
- The console will log the available morph targets found in your model

If you have issues with the DRACO compression:
- Make sure you have the correct dependencies installed
- Check that the DRACO decoder path is set correctly in `main.js`
- Try using the Google CDN path as a fallback 