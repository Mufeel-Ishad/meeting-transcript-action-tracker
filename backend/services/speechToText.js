const fs = require('fs-extra');
const path = require('path');

class SpeechToTextService {
  constructor() {
    this.apiKey = process.env.ASSEMBLYAI_API_KEY;
    this.apiUrl = 'https://api.assemblyai.com/v2';
    this.isAvailable = !!this.apiKey;
    
    if (!this.apiKey) {
      console.warn('AssemblyAI API key not found. Audio-to-text conversion will not be available.');
      console.warn('Please set ASSEMBLYAI_API_KEY in your environment variables.');
    }
  }

  /**
   * Convert audio file to text using AssemblyAI API
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeAudio(audioFilePath) {
    if (!this.isAvailable) {
      throw new Error('AssemblyAI API key is not configured. Please set ASSEMBLYAI_API_KEY in your environment variables.');
    }

    try {
      // Step 1: Upload audio file to AssemblyAI
      const audioData = await fs.readFile(audioFilePath);
      const uploadResponse = await fetch(`${this.apiUrl}/upload`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
        },
        body: audioData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(`Failed to upload audio: ${errorData.error || uploadResponse.statusText}`);
      }

      const uploadData = await uploadResponse.json();
      const audioUrl = uploadData.upload_url;

      // Step 2: Submit transcription request
      const transcriptResponse = await fetch(`${this.apiUrl}/transcript`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          audio_url: audioUrl,
          language_code: 'en',
          punctuate: true,
          format_text: true,
        }),
      });

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        throw new Error(`Failed to submit transcription: ${errorData.error || transcriptResponse.statusText}`);
      }

      const transcriptData = await transcriptResponse.json();
      const transcriptId = transcriptData.id;

      // Step 3: Poll for transcription completion
      let transcription = null;
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes max (5 seconds * 60)

      while (!transcription && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

        const statusResponse = await fetch(`${this.apiUrl}/transcript/${transcriptId}`, {
          headers: {
            'authorization': this.apiKey,
          },
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check transcription status');
        }

        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed') {
          transcription = statusData.text;
        } else if (statusData.status === 'error') {
          throw new Error(`Transcription failed: ${statusData.error}`);
        }

        attempts++;
      }

      if (!transcription) {
        throw new Error('Transcription timed out. Please try again with a shorter audio file.');
      }

      return transcription;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  }

  /**
   * Check if the service is available
   * @returns {boolean}
   */
  isServiceAvailable() {
    return this.isAvailable;
  }
}

module.exports = new SpeechToTextService();
