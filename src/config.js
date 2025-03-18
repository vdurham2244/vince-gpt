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
                throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
            throw error;
        }
    }

    get(key) {
        if (!this.#config) {
            throw new Error('Configuration not initialized. Call init() first.');
        }
        return this.#config[key];
    }
}

export const config = new Config(); 