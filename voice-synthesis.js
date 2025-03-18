class VoiceSynthesis {
    constructor(apiKey) {
        if (!apiKey) {
            console.error('ElevenLabs API key is missing');
            throw new Error('ElevenLabs API key is required');
        }
        this.apiKey = apiKey;
        this.audioContext = null;
        this.isAudioEnabled = false;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        // Detect iOS 18+ specifically
        this.isIOS18Plus = this.isIOS && /Version\/1[8-9]/.test(navigator.userAgent);
        // Use HTMLAudioElement as fallback on newer iOS
        this.fallbackAudio = this.isIOS18Plus ? new Audio() : null;
        
        console.log('Device info:', {
            isMobile: this.isMobile,
            isIOS: this.isIOS,
            isIOS18Plus: this.isIOS18Plus,
            userAgent: navigator.userAgent
        });
    }

    async initializeAudioContext() {
        try {
            // iPhone 13 iOS 18 workaround - try to play a silent sound with HTML5 Audio first
            if (this.isIOS18Plus) {
                try {
                    console.log('iOS 18+ detected, attempting HTML5 Audio initialization');
                    const audio = new Audio();
                    audio.src = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
                    audio.load();
                    await audio.play();
                    console.log('HTML5 Audio initialization successful');
                    this.fallbackAudio = audio; // Save for potential fallback use
                } catch (e) {
                    console.warn('HTML5 Audio initialization failed:', e);
                }
            }
            
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            console.log('Initial AudioContext state:', this.audioContext.state);
            
            // For iOS/Safari, make absolutely sure we resume synchronously
            if (this.isIOS || this.isMobile) {
                console.log('Mobile device detected, using aggressive audio unlocking');
                // Try immediate resume
                try {
                    await this.audioContext.resume();
                } catch (e) {
                    console.warn('Initial resume attempt failed:', e);
                }
            }

            // Create and play a silent buffer to unlock audio on mobile
            const silentBuffer = this.audioContext.createBuffer(1, 1, 22050);
            const source = this.audioContext.createBufferSource();
            source.buffer = silentBuffer;
            source.connect(this.audioContext.destination);
            
            console.log('Attempting to resume audio context...');
            
            // Ensure the context is resumed BEFORE playing sound
            await this.audioContext.resume();
            
            console.log('Starting silent sound playback...');
            source.start(0);
            
            console.log('AudioContext state after silent sound:', this.audioContext.state);
            this.isAudioEnabled = this.audioContext.state === 'running';
            
            // iOS might need multiple attempts
            if ((this.isIOS || this.isMobile) && !this.isAudioEnabled) {
                console.log('Mobile device detected, trying additional audio unlock techniques');
                await this._unlockAudioiOS();
            }
            
            // iOS 18+ specific check - if WebAudio still not running, but HTML5 Audio worked, consider audio enabled
            if (this.isIOS18Plus && !this.isAudioEnabled && this.fallbackAudio) {
                console.log('iOS 18+: WebAudio not running but HTML5 Audio available, setting audio as enabled');
                this.isAudioEnabled = true;
            }
            
            return this.isAudioEnabled;
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            
            // iOS 18+ specific fallback - if HTML5 Audio is available, consider audio enabled
            if (this.isIOS18Plus && this.fallbackAudio) {
                console.log('iOS 18+: WebAudio failed but HTML5 Audio available, setting audio as enabled');
                this.isAudioEnabled = true;
                return true;
            }
            
            this.isAudioEnabled = false;
            return false;
        }
    }
    
    // Additional method to handle iOS audio unlocking
    async _unlockAudioiOS() {
        try {
            console.log('Running specialized iOS audio unlock routine');
            
            // Try forcing context creation with a user gesture
            if (this.audioContext.state !== 'running') {
                // Try multiple times to resume the context
                for (let i = 0; i < 3; i++) {
                    console.log(`iOS resume attempt ${i+1}...`);
                    await this.audioContext.resume();
                    
                    // Create another silent sound
                    const buffer = this.audioContext.createBuffer(1, 1, 22050);
                    const source = this.audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(this.audioContext.destination);
                    source.start(0);
                    
                    // Check if it worked
                    if (this.audioContext.state === 'running') {
                        console.log('iOS audio successfully unlocked!');
                        this.isAudioEnabled = true;
                        break;
                    }
                    
                    // Wait a bit before trying again
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
            
            console.log('iOS unlock routine completed, audio state:', this.audioContext.state);
            return this.isAudioEnabled = (this.audioContext.state === 'running');
        } catch (e) {
            console.error('iOS audio unlock failed:', e);
            return false;
        }
    }

    async playTestSound() {
        try {
            if (!this.audioContext || this.audioContext.state === 'suspended') {
                console.log('Audio context needs initialization or is suspended');
                await this.initializeAudioContext();
            }

            if (this.audioContext.state !== 'running') {
                console.log('Attempting to resume audio context before playing test sound');
                await this.audioContext.resume();
                
                // For iOS, we may need additional help
                if (this.isIOS && this.audioContext.state !== 'running') {
                    await this._unlockAudioiOS();
                }
            }

            console.log('Audio context state before test sound:', this.audioContext.state);
            
            // Create a short beep sound - using a very short duration for mobile
            const duration = this.isMobile ? 0.1 : 0.2;
            const frequency = 440;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
            
            console.log('Starting test sound oscillator');
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
            
            // Update audio enabled state based on successful playback
            this.isAudioEnabled = this.audioContext.state === 'running';
            
            console.log('Test sound played, audio enabled:', this.isAudioEnabled);
            
            return new Promise(resolve => setTimeout(resolve, duration * 1000));
        } catch (error) {
            console.error('Error playing test sound:', error);
            this.isAudioEnabled = false;
            return Promise.resolve();
        }
    }

    async synthesizeSpeech(text, voiceId) {
        if (!this.isAudioEnabled) {
            console.warn('Audio is not enabled. Cannot synthesize speech.');
            return null;
        }

        if (!voiceId) {
            console.error('Voice ID is missing');
            throw new Error('Voice ID is required');
        }

        try {
            // Ensure audio context is running if we're using WebAudio
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            console.log('Sending request to ElevenLabs API...');
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': this.apiKey
                },
                body: JSON.stringify({
                    text: text,
                    model_id: "eleven_monolingual_v1",
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('ElevenLabs API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
            }

            console.log('Received audio data from ElevenLabs');
            const audioData = await response.arrayBuffer();
            
            // iOS 18+ specific handling - try HTML5 Audio first
            if (this.isIOS18Plus) {
                try {
                    console.log('iOS 18+: Attempting to play using HTML5 Audio');
                    const blob = new Blob([audioData], { type: 'audio/mpeg' });
                    const audioUrl = URL.createObjectURL(blob);
                    
                    // Create a new Audio element for this specific playback
                    const audio = new Audio(audioUrl);
                    
                    // Get duration before playing
                    return new Promise((resolve) => {
                        audio.addEventListener('loadedmetadata', () => {
                            const duration = audio.duration * 1000; // Convert to ms
                            console.log('HTML5 Audio duration:', duration);
                            
                            // Start playing
                            audio.play().then(() => {
                                console.log('HTML5 Audio playback started');
                                resolve({
                                    source: { 
                                        // Create a dummy source object to match WebAudio API
                                        start: () => console.log('HTML5 Audio already started') 
                                    },
                                    duration: duration
                                });
                            }).catch(err => {
                                console.error('HTML5 Audio playback failed:', err);
                                // Fall back to WebAudio if available
                                if (this.audioContext && this.audioContext.state === 'running') {
                                    this._playWithWebAudio(audioData).then(resolve);
                                } else {
                                    resolve({ source: null, duration: 0 });
                                }
                            });
                        });
                        
                        audio.addEventListener('error', (e) => {
                            console.error('HTML5 Audio error:', e);
                            resolve({ source: null, duration: 0 });
                        });
                        
                        audio.load();
                    });
                } catch (e) {
                    console.error('iOS 18+ HTML5 Audio playback failed:', e);
                    // Fall back to WebAudio
                }
            }
            
            // Standard WebAudio playback
            return this._playWithWebAudio(audioData);
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            throw error;
        }
    }
    
    // Helper method to play with WebAudio
    async _playWithWebAudio(audioData) {
        try {
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            
            return {
                source,
                duration: audioBuffer.duration * 1000 // Convert to milliseconds
            };
        } catch (e) {
            console.error('WebAudio playback setup failed:', e);
            return { source: null, duration: 0 };
        }
    }

    async playSpeech(text, voiceId) {
        if (!this.isAudioEnabled) {
            console.warn('Audio is not enabled. Cannot play speech.');
            
            // Try to re-enable audio on demand
            if (this.isMobile || this.isIOS) {
                console.log('Attempting to re-enable audio for speech...');
                await this.initializeAudioContext();
                
                // If still not enabled, return
                if (!this.isAudioEnabled) {
                    console.error('Failed to enable audio for speech');
                    return 0;
                }
            } else {
                return 0;
            }
        }

        try {
            // Resume context before synthesizing if using WebAudio
            if (this.audioContext && this.audioContext.state === 'suspended') {
                console.log('Resuming audio context before speech...');
                await this.audioContext.resume();
                
                if (this.audioContext.state !== 'running') {
                    console.warn('Failed to resume audio context for speech');
                    if (this.isIOS || this.isMobile) {
                        await this._unlockAudioiOS();
                    }
                }
            }
            
            const result = await this.synthesizeSpeech(text, voiceId);
            if (result) {
                // If we're using HTML5 Audio on iOS 18+, the source has already started
                // Only start if we're using WebAudio
                if (result.source && result.source.start && !this.isIOS18Plus) {
                    // One final check before starting playback
                    if (this.audioContext && this.audioContext.state !== 'running') {
                        console.log('Final audio context resume attempt before playback...');
                        await this.audioContext.resume();
                    }
                    
                    console.log('Starting speech playback with WebAudio...');
                    result.source.start(0);
                }
                
                console.log(`Speech playback started, duration: ${result.duration}ms`);
                return result.duration;
            }
            return 0;
        } catch (error) {
            console.error('Error playing speech:', error);
            return 0;
        }
    }
}

export default VoiceSynthesis; 