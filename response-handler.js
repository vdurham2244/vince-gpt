import OpenAIHandler from './openai-handler.js';

class ResponseHandler {
    constructor(openaiHandler) {
        this.openaiHandler = openaiHandler;
    }

    // Generate a response based on the input
    async generateResponse(input) {
        try {
            return await this.openaiHandler.generateResponse(input);
        } catch (error) {
            console.error('Error generating response:', error);
            // Fallback responses if OpenAI fails
            return "I apologize, but I'm having trouble processing your request right now. Could you please try again?";
        }
    }

    // Set a new system prompt
    setSystemPrompt(prompt) {
        this.openaiHandler.setSystemPrompt(prompt);
    }

    // Clear conversation history
    clearHistory() {
        this.openaiHandler.clearHistory();
    }
}

export default ResponseHandler; 