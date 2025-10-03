// Image Generation Service using Stable Diffusion
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../../../shared/utils/logger.cjs');
const config = require('../../../config/env.cjs');

class ImageGenerationService {
    constructor() {
        this.sdUrl = config.STABLE_DIFFUSION_URL;
        this.modelPath = config.STABLE_DIFFUSION_MODEL_PATH;
        this.outputPath = path.join(__dirname, '../../../uploads/generated-images');
    }

    async generateImage(prompt, options = {}) {
        try {
            // First try with Stable Diffusion API
            const response = await fetch(`${this.sdUrl}/sdapi/v1/txt2img`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    steps: options.steps || 30,
                    width: options.width || 512,
                    height: options.height || 512,
                    cfg_scale: options.cfgScale || 7.5
                })
            });

            if (!response.ok) {
                throw new Error('Stable Diffusion API failed');
            }

            return await response.json();
        } catch (error) {
            logger.error('Image generation error:', error);
            // Fallback to local model if API fails
            return this.generateImageLocally(prompt, options);
        }
    }

    async generateImageLocally(prompt, options = {}) {
        try {
            const outputFile = path.join(this.outputPath, `${Date.now()}.png`);
            const command = `python -c "import torch; from diffusers import StableDiffusionPipeline; pipe = StableDiffusionPipeline.from_pretrained('${this.modelPath}', torch_dtype=torch.float16).to('cuda'); pipe(prompt='${prompt}', num_inference_steps=${options.steps || 30})[0][0].save('${outputFile}')"`;
            
            execSync(command);
            return { path: outputFile };
        } catch (error) {
            logger.error('Local image generation error:', error);
            throw error;
        }
    }

    async enhanceImage(imageBuffer, options = {}) {
        // Implementation of image enhancement using various models
        // This is a placeholder for the actual implementation
        return imageBuffer;
    }
}

module.exports = new ImageGenerationService();