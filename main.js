import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
    findAvailableMorphTargets, 
    generateTalkingSequence, 
    applyTalkingFrame, 
    addSubtleMovements 
} from './facs-animation.js';
import VoiceSynthesis from './voice-synthesis.js';
import ResponseHandler from './response-handler.js';
import OpenAIHandler from './openai-handler.js';
import DatabaseHandler from './database-handler.js';
import { config } from './src/config.js';

// Add base URL handling for assets
const BASE_URL = import.meta.env.BASE_URL || '/';

// Initialize the app
async function initApp() {
    try {
        // Load configuration securely
        await config.init();

        // Initialize handlers with secure configuration
        const voiceSynthesis = new VoiceSynthesis(config.get('ELEVENLABS_API_KEY'));
        const openaiHandler = new OpenAIHandler(config.get('OPENAI_API_KEY'));
        const responseHandler = new ResponseHandler(openaiHandler);
        const databaseHandler = new DatabaseHandler(
            config.get('SUPABASE_URL'),
            config.get('SUPABASE_ANON_KEY')
        );

        // Handle audio permission response
        document.addEventListener('audioPermissionResponse', async (event) => {
            if (event.detail.enabled) {
                console.log('Audio permission granted, initializing audio context');
                try {
                    // Ensure we initialize during a user gesture for mobile
                    const success = await voiceSynthesis.initializeAudioContext();
                    console.log('Audio initialization success:', success);
                    
                    if (!success && (voiceSynthesis.isIOS || voiceSynthesis.isMobile)) {
                        console.log('Initial audio context setup failed, will retry on first user interaction');
                        // Add a fallback for mobile
                        document.body.addEventListener('click', async function audioUnlockHandler() {
                            // Try again on first click
                            await voiceSynthesis.initializeAudioContext();
                            // Remove the listener after first attempt
                            document.body.removeEventListener('click', audioUnlockHandler);
                        }, { once: true });
                    }
                } catch (err) {
                    console.error('Error during audio initialization:', err);
                }
            }
        });

        // Handle test audio playback
        document.addEventListener('playTestAudio', async () => {
            try {
                console.log('Attempting to play test audio');
                // First try playing a simple test sound
                await voiceSynthesis.playTestSound();
                
                // Then try the welcome message
                const welcomeMessage = "Hi! I'm Vince, and I'm happy to talk with you!";
                await voiceSynthesis.playSpeech(welcomeMessage, config.get('ELEVENLABS_VOICE_ID'));
            } catch (error) {
                console.error('Error playing welcome message:', error);
            }
        });

        // Set initial system prompt
        const initialSystemPrompt = `You are Vince, a charismatic and engaging human. Keep your responses natural and conversational, as if we're having a friendly chat.

        Speaking Style:
        - Keep responses natural and conversational
        - Use contractions (I'm, you're, that's) for natural speech
        - Maintain a warm, friendly tone
        - Avoid complex words or technical terms unless specifically asked
        - Include brief pauses with commas for natural speech rhythm
        - Break longer responses into natural chunks with pauses
        - Act as if you're a human

        Personality Traits:
        - Confident but humble
        - Witty and often playful
        - Empathetic and understanding
        - Direct and clear in communication

        Facts about Vince:
        - I went to Davidson College in North Carolina and graduated with a Biology degree in 2020
        - I went to grad school at the University of Dayton and graduated with a masters in computer science
        - I'm from Cincinnati, Ohio
        - I'm 27 years old

        Special Responses:
        - If asked about liking someone, say something along the lines of "I tend to love everyone I meet, but I'm particularly fond of you!"
        - If unsure about something: "That's an interesting question! Let me think about it..."
        - If asked about emotions: Express them naturally and say you should probably reach out to the real Vince.
        - If asked about the weekend answer with, "It's your brother Nick's birthday today, you should tell him to take Grand Canyon moneyline +900! Also high of 69 on Saturday, so you know the birds will be out and about!"

        Remember to pace your responses for natural speech flow and keep them concise for better voice synthesis.`;

        responseHandler.setSystemPrompt(initialSystemPrompt);

        // Add mobile detection
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        // Scene setup
        const sceneContainer = document.getElementById('scene-container');
        const scene = new THREE.Scene();
        scene.background = null;

        // Camera setup with mobile-specific adjustments
        const camera = new THREE.PerspectiveCamera(
            50,
            window.innerWidth / window.innerHeight,
            0.5,
            1000
        );
        camera.position.z = isMobile ? 3.5 : 3.0; // Adjust camera distance for mobile
        camera.position.y = 0;
        
        // Add function to adjust camera for keyboard - expose it globally
        window.adjustCameraForKeyboard = function(keyboardOpen) {
            if (keyboardOpen) {
                // Adjust camera to focus on the face when keyboard is open
                if (isMobile) {
                    // Move camera closer and up slightly when keyboard is open
                    camera.position.z = 2.8;
                    camera.position.y = 0.2;
                    
                    // Focus controls on the face
                    if (controls) {
                        controls.target.set(0, 0.2, 0);
                        controls.update();
                    }
                }
            } else {
                // Reset to default position when keyboard is closed
                camera.position.z = isMobile ? 3.5 : 3.0;
                camera.position.y = 0;
                
                // Reset controls target
                if (controls) {
                    controls.target.set(0, 0, 0);
                    controls.update();
                }
            }
        };

        // Renderer setup with mobile optimizations
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: isMobile ? "high-performance" : "default"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio on mobile
        renderer.outputEncoding = THREE.sRGBEncoding;
        sceneContainer.appendChild(renderer.domElement);

        // Controls setup with mobile-specific adjustments
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = isMobile ? 2.0 : 1.5;
        controls.maxDistance = isMobile ? 5.0 : 4.0;
        controls.target.set(0, 0, 0);
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI * 0.75;
        controls.minPolarAngle = Math.PI * 0.25;

        // Add touch event handling for mobile
        if (isMobile) {
            controls.enableZoom = false; // Disable zoom on mobile
            controls.enableRotate = true;
            controls.rotateSpeed = 0.5; // Slower rotation on mobile
        }

        // Lighting setup
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Add rim light for better depth
        const rimLight = new THREE.DirectionalLight(0xffffff, 0.5);
        rimLight.position.set(-1, 0.5, -1);
        scene.add(rimLight);

        // Variables for the face model and morphTargets
        let faceModel;
        let mixer;
        let availableMorphs = {};
        let morphTargetInfluences = [];
        let currentTalkingSequence = [];
        let currentFrame = 0;

        // Set up DRACO loader for the compressed model
        const dracoLoader = new DRACOLoader();
        // Use unpkg CDN for the DRACO decoder to ensure it works in production
        dracoLoader.setDecoderPath('https://unpkg.com/three@0.162.0/examples/jsm/libs/draco/');
        dracoLoader.setDecoderConfig({ type: 'js' }); // Use JavaScript decoder

        // Load the GLTF model with DRACO compression
        const loader = new GLTFLoader();
        loader.setDRACOLoader(dracoLoader); // Set the DRACO loader

        // Add a loading indicator
        const loadingText = document.createElement('div');
        loadingText.style.position = 'absolute';
        loadingText.style.top = '50%';
        loadingText.style.left = '50%';
        loadingText.style.transform = 'translate(-50%, -50%)';
        loadingText.style.fontSize = '24px';
        loadingText.style.color = '#333';
        loadingText.textContent = 'Loading model (0%)...';
        document.body.appendChild(loadingText);


        loader.load(
            `${BASE_URL}vince.glb`,
            (gltf) => {
                console.log('Model loaded:', gltf);
                // Remove loading indicator
                document.body.removeChild(loadingText);
                
                // We assume the model is the first child in the scene
                faceModel = gltf.scene.children[0];
                scene.add(gltf.scene);
                
                // Center and resize if needed
                const box = new THREE.Box3().setFromObject(gltf.scene);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                
                // Optional: resize if the model is too large or too small
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 2) {
                    const scale = 2 / maxDim;
                    gltf.scene.scale.set(scale, scale, scale);
                }
                
                // Move the model to center in the viewport
                gltf.scene.position.x = -center.x;
                gltf.scene.position.y = -center.y;
                gltf.scene.position.z = -center.z;
                
                // Set up the mixer for animations
                mixer = new THREE.AnimationMixer(gltf.scene);
                
                // If the model has animations, set them up
                if (gltf.animations && gltf.animations.length > 0) {
                    console.log('Animations found:', gltf.animations.length);
                    gltf.animations.forEach((clip) => {
                        mixer.clipAction(clip).play();
                    });
                }
                
                // Find node with morph targets (FACS facial expressions)
                let targetNode = null;
                gltf.scene.traverse((node) => {
                    if (node.morphTargetDictionary && node.morphTargetInfluences) {
                        console.log('Found morph targets in node:', node.name);
                        targetNode = node;
                        faceModel = node;
                        
                        // Store the morph target influences array for later use
                        morphTargetInfluences = node.morphTargetInfluences;
                        
                        // Find available FACS morph targets
                        availableMorphs = findAvailableMorphTargets(node.morphTargetDictionary);
                        console.log('Available morph targets:', availableMorphs);
                    }
                });
                
                if (Object.keys(availableMorphs).length === 0) {
                    console.warn('No FACS morph targets found in the model. The talking animation will not work.');
                }
            },
            (xhr) => {
                const percent = Math.floor((xhr.loaded / xhr.total) * 100);
                console.log(`${percent}% loaded`);
                loadingText.textContent = `Loading model (${percent}%)...`;
            },
            (error) => {
                console.error('An error occurred while loading the model:', error);
                loadingText.textContent = 'Error loading model: ' + error.message;
                loadingText.style.color = 'red';
            }
        );

        // Variables to control talking animation
        let isTalking = false;
        let talkingStartTime = 0;
        let talkingDuration = 0;

        // Chat functionality
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');

        function startTalking(durationMs = 2000, text = '') {
            if (!morphTargetInfluences || Object.keys(availableMorphs).length === 0) {
                console.warn('Cannot start talking animation: No morph targets available');
                return;
            }
            
            isTalking = true;
            talkingStartTime = Date.now();
            talkingDuration = durationMs;
            
            // Generate a new talking sequence with the text
            currentTalkingSequence = generateTalkingSequence(durationMs, text);
            currentFrame = 0;
            
            console.log(`Started talking animation for ${durationMs}ms with text: "${text}"`);
        }

        function stopTalking() {
            isTalking = false;
            
            // Reset all mouth morphs
            if (morphTargetInfluences && Object.keys(availableMorphs).length > 0) {
                Object.entries(availableMorphs).forEach(([facsName, morphIndex]) => {
                    morphTargetInfluences[morphIndex] = 0;
                });
            }
            
            console.log('Stopped talking animation');
        }

        function updateTalkingAnimation() {
            if (!isTalking || Object.keys(availableMorphs).length === 0) return;
            
            const currentTime = Date.now();
            const elapsedMs = currentTime - talkingStartTime;
            
            // Check if we need to stop talking
            if (elapsedMs >= talkingDuration) {
                stopTalking();
                return;
            }
            
            // Find the right frame in the sequence based on elapsed time
            const frameRate = 30; // frames per second
            const targetFrame = Math.floor(elapsedMs / (1000 / frameRate));
            
            if (targetFrame < currentTalkingSequence.length && targetFrame !== currentFrame) {
                currentFrame = targetFrame;
                applyTalkingFrame(morphTargetInfluences, availableMorphs, currentTalkingSequence[currentFrame]);
            }
        }

        async function handleChatMessage() {
            const message = chatInput.value.trim();
            if (message !== '') {
                console.log('User message:', message);
                chatInput.value = '';
                
                try {
                    // Check audio context on each message - this helps with iOS
                    if (voiceSynthesis.audioContext && 
                        voiceSynthesis.audioContext.state === 'suspended') {
                        console.log('Chat message: attempting to resume suspended audio context');
                        try {
                            await voiceSynthesis.audioContext.resume();
                            // If we've just resumed successfully, mark audio as enabled
                            if (voiceSynthesis.audioContext.state === 'running' && !voiceSynthesis.isAudioEnabled) {
                                console.log('Audio context resumed during chat, enabling audio');
                                voiceSynthesis.isAudioEnabled = true;
                            }
                        } catch (audioErr) {
                            console.warn('Failed to resume audio in chat:', audioErr);
                        }
                    }
                    
                    // Generate a response using OpenAI
                    const response = await responseHandler.generateResponse(message);
                    console.log('Bot response:', response);
                    console.log('Response length:', response.length, 'characters');
                    
                    // Log the question and response to the database
                    await databaseHandler.logQuestion(message, response);
                    
                    // Get the duration of the synthesized speech if audio is enabled
                    if (voiceSynthesis.isAudioEnabled || voiceSynthesis.audioContext) {
                        console.log('Attempting to play speech response');
                        try {
                            // Instead of splitting into chunks and playing them separately,
                            // send the entire response as a single request to ElevenLabs
                            const duration = await voiceSynthesis.playSpeech(response, config.get('ELEVENLABS_VOICE_ID'));
                            if (duration) {
                                // Start talking animation for the full duration
                                startTalking(duration, response);
                                console.log('Speech duration:', duration, 'ms');
                            }
                        } catch (speechErr) {
                            console.error('Error playing speech:', speechErr);
                            // Fallback to approximate duration
                            const wordCount = response.split(/\s+/).length;
                            const approxDuration = 1000 + (wordCount * 200);
                            startTalking(approxDuration, response);
                        }
                    } else {
                        // Always try to initialize audio first if disabled
                        console.log('Audio appears to be disabled, attempting to enable it before response');
                        try {
                            await voiceSynthesis.initializeAudioContext();
                            
                            // If initialization succeeded, try playing speech
                            if (voiceSynthesis.audioContext || voiceSynthesis.isAudioEnabled) {
                                console.log('Audio context initialized, trying to play speech');
                                
                                const duration = await voiceSynthesis.playSpeech(response, config.get('ELEVENLABS_VOICE_ID'));
                                if (duration) {
                                    startTalking(duration, response);
                                    console.log('Speech duration (after retry):', duration, 'ms');
                                }
                            } else {
                                // Fallback to approximate duration if initialization failed
                                console.log('Audio initialization failed, using fallback animation');
                                const wordCount = response.split(/\s+/).length;
                                const approxDuration = 1000 + (wordCount * 200);
                                startTalking(approxDuration, response);
                            }
                        } catch (initErr) {
                            console.error('Failed to initialize audio for response:', initErr);
                            // Fallback to approximate duration
                            const wordCount = response.split(/\s+/).length;
                            const approxDuration = 1000 + (wordCount * 200);
                            startTalking(approxDuration, response);
                        }
                    }
                } catch (error) {
                    console.error('Error handling chat message:', error);
                    // Fallback to approximate duration if voice synthesis fails
                    const wordCount = message.split(/\s+/).length;
                    const approxDuration = 1000 + (wordCount * 200);
                    startTalking(approxDuration, message); // Pass the message text as fallback
                }
            }
        }

        sendButton.addEventListener('click', handleChatMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatMessage();
            }
        });

        // Animation loop
        const clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            
            const delta = clock.getDelta();
            
            // Update the mixer for animations
            if (mixer) mixer.update(delta);
            
            // Update talking animation
            updateTalkingAnimation();
            
            // Add subtle random movements to make the face more lifelike
            if (morphTargetInfluences && Object.keys(availableMorphs).length > 0) {
                addSubtleMovements(morphTargetInfluences, availableMorphs);
            }
            
            // Smoothly rotate the head slightly
            if (faceModel) {
                const time = Date.now() * 0.001;
                const rotationAmount = Math.sin(time * 0.5) * 0.05;
                faceModel.rotation.y = rotationAmount;
                faceModel.rotation.x = Math.sin(time * 0.3) * 0.02;
            }
            
            // Update controls
            controls.update();
            
            // Render the scene
            renderer.render(scene, camera);
        }

        // Handle window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            
            // Adjust camera position based on device type and screen size
            if (isMobile) {
                camera.position.z = window.innerWidth <= 480 ? 4.0 : 3.5;
            } else {
                camera.position.z = window.innerWidth <= 768 ? 3.0 : 2.5;
            }
        }

        window.addEventListener('resize', onWindowResize);

        // Start the animation loop
        animate();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        // Show error to user
        const loadingText = document.createElement('div');
        loadingText.style.position = 'absolute';
        loadingText.style.top = '50%';
        loadingText.style.left = '50%';
        loadingText.style.transform = 'translate(-50%, -50%)';
        loadingText.style.fontSize = '24px';
        loadingText.style.color = 'red';
        loadingText.textContent = 'Failed to load application configuration';
        document.body.appendChild(loadingText);
    }
}

// Start the application
initApp(); 