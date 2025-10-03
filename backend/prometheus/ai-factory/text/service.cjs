// AI Factory Text Generation Service
const HuggingFaceAPI = require('@huggingface/inference');
const logger = require('../../../shared/utils/logger.cjs');
const config = require('../../../config/env.cjs');

class TextGenerationService {
    constructor() {
        this.hf = new HuggingFaceAPI(config.HUGGINGFACE_API_KEY);
        this.models = {
            gptj: 'EleutherAI/gpt-j-6B',
            falcon: 'tiiuae/falcon-7b',
            mistral: 'mistralai/Mistral-7B-v0.1',
            llama2: 'meta-llama/Llama-2-7b-chat-hf'
        };
    }

    async generateText(prompt, model = 'mistral', maxLength = 1000) {
        try {
            const result = await this.hf.textGeneration({
                model: this.models[model],
                inputs: prompt,
                parameters: {
                    max_length: maxLength,
                    temperature: 0.7,
                    top_p: 0.95
                }
            });
            return result.generated_text;
        } catch (error) {
            logger.error('Text generation error:', error);
            // Fallback to alternative model if primary fails
            if (model !== 'gptj') {
                logger.info('Falling back to GPT-J model');
                return this.generateText(prompt, 'gptj', maxLength);
            }
            throw error;
        }
    }

    async analyzeContent(text) {
        try {
            const result = await this.hf.textClassification({
                model: 'facebook/bart-large-mnli',
                inputs: text
            });
            return result;
        } catch (error) {
            logger.error('Content analysis error:', error);
            throw error;
        }
    }
}

module.exports = new TextGenerationService();