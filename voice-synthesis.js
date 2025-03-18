class VoiceSynthesis {
    constructor(apiKey) {
        if (!apiKey) {
            console.error('ElevenLabs API key is missing');
            throw new Error('ElevenLabs API key is required');
        }
        this.apiKey = apiKey;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    async synthesizeSpeech(text, voiceId) {
        if (!voiceId) {
            console.error('Voice ID is missing');
            throw new Error('Voice ID is required');
        }

        try {
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
            const audioBuffer = await this.audioContext.decodeAudioData(audioData);
            
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);
            
            return {
                source,
                duration: audioBuffer.duration * 1000 // Convert to milliseconds
            };
        } catch (error) {
            console.error('Error synthesizing speech:', error);
            throw error;
        }
    }

    async playSpeech(text, voiceId) {
        const { source, duration } = await this.synthesizeSpeech(text, voiceId);
        source.start(0);
        return duration;
    }
}

export default VoiceSynthesis; 