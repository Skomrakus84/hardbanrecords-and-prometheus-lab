// Audio Generation and Processing Service
const path = require('path');
const { execSync } = require('child_process');
const logger = require('../../../shared/utils/logger.cjs');
const config = require('../../../config/env.cjs');

class AudioGenerationService {
    constructor() {
        this.riffusionPath = config.RIFFUSION_MODEL_PATH;
        this.barkPath = config.BARK_MODEL_PATH;
        this.openVoicePath = config.OPENVOICE_MODEL_PATH;
        this.tempDir = config.AUDIO_TEMP_DIR;
    }

    async generateMusic(prompt, options = {}) {
        try {
            const outputFile = path.join(this.tempDir, `${Date.now()}.wav`);
            // Using Riffusion for music generation
            const command = `python ${this.riffusionPath}/inference.py --prompt "${prompt}" --output "${outputFile}"`;
            execSync(command);
            return { path: outputFile };
        } catch (error) {
            logger.error('Music generation error:', error);
            throw error;
        }
    }

    async generateVoice(text, voiceId = 'default', options = {}) {
        try {
            const outputFile = path.join(this.tempDir, `${Date.now()}.wav`);
            // Using Bark for voice generation with fallback to OpenVoice
            try {
                const command = `python ${this.barkPath}/generate.py --text "${text}" --output "${outputFile}"`;
                execSync(command);
            } catch (error) {
                logger.warn('Bark failed, falling back to OpenVoice');
                const fallbackCommand = `python ${this.openVoicePath}/generate.py --text "${text}" --output "${outputFile}"`;
                execSync(fallbackCommand);
            }
            return { path: outputFile };
        } catch (error) {
            logger.error('Voice generation error:', error);
            throw error;
        }
    }

    async enhanceAudio(audioBuffer, options = {}) {
        try {
            // Audio enhancement and processing logic
            return audioBuffer;
        } catch (error) {
            logger.error('Audio enhancement error:', error);
            throw error;
        }
    }

    async convertFormat(inputPath, outputFormat = 'mp3') {
        try {
            const outputFile = path.join(this.tempDir, `${Date.now()}.${outputFormat}`);
            const command = `ffmpeg -i "${inputPath}" "${outputFile}"`;
            execSync(command);
            return { path: outputFile };
        } catch (error) {
            logger.error('Format conversion error:', error);
            throw error;
        }
    }
}

module.exports = new AudioGenerationService();