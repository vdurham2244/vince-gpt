// Configuration management
class Config {
    static #instance = null;
    #config = null;

    constructor() {
        if (Config.#instance) {
            return Config.#instance;
        }
        Config.#instance = this;
    }

    async init() {
        try {
            // Use environment variables directly in both development and production
            this.#config = {
                ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY,
                ELEVENLABS_VOICE_ID: import.meta.env.VITE_ELEVENLABS_VOICE_ID,
                OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
                SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
                SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
            };

            // Validate that all required environment variables are present
            const missingVars = Object.entries(this.#config)
                .filter(([_, value]) => !value)
                .map(([key]) => key);

            if (missingVars.length > 0) {
                throw new Error(
                    `Missing required environment variables: ${missingVars.join(', ')}. ` +
                    'Please ensure all environment variables are set in your Vercel project settings.'
                );
            }

            // Log success in development only
            if (import.meta.env.DEV) {
                console.log('Configuration loaded successfully');
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            
            // In development, show more detailed error
            if (import.meta.env.DEV) {
                throw error;
            } else {
                // In production, show user-friendly error
                throw new Error(
                    'Unable to load application configuration. ' +
                    'If you are the developer, please check your Vercel environment variables.'
                );
            }
        }
    }

    get(key) {
        if (!this.#config) {
            throw new Error('Configuration not initialized. Call init() first.');
        }
        const value = this.#config[key];
        if (!value) {
            throw new Error(`Configuration value for ${key} is not set.`);
        }
        return value;
    }
}

export const config = new Config(); 