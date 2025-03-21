class OpenAIHandler {
    constructor(apiKey, systemPrompt = '') {
        this.apiKey = apiKey;
        this.systemPrompt = systemPrompt;
        this.conversationHistory = [];
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
        this.conversationHistory = []; // Reset conversation when changing system prompt
    }

    async generateResponse(userInput) {
        try {
            const messages = [];
            
            // Add system prompt if it exists
            if (this.systemPrompt) {
                messages.push({
                    role: 'system',
                    content: this.systemPrompt
                });
            }

            // Add conversation history
            messages.push(...this.conversationHistory);

            // Add current user input
            messages.push({
                role: 'user',
                content: userInput
            });

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini', // You can change this to your preferred model
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const data = await response.json();
            const assistantResponse = data.choices[0].message.content;

            // Update conversation history
            this.conversationHistory.push(
                { role: 'user', content: userInput },
                { role: 'assistant', content: assistantResponse }
            );

            // Keep conversation history manageable (last 10 exchanges)
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            return assistantResponse;
        } catch (error) {
            console.error('Error generating OpenAI response:', error);
            throw error;
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

export default OpenAIHandler; 