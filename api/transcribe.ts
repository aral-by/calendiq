import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'stream';
import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not configured' });
  }

  try {
    // Parse multipart form data
    const form = formidable({ maxFileSize: 25 * 1024 * 1024 }); // 25MB max
    
    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const audioFile = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Read the audio file
    const audioBuffer = fs.readFileSync(audioFile.filepath);

    // Create form data for Groq API
    const formData = new FormData();
    formData.append('file', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm',
    });
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'tr'); // Turkish
    formData.append('response_format', 'json');

    // Send to Groq Whisper API
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        ...formData.getHeaders(),
      },
      body: formData as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(response.status).json({ 
        error: 'Transcription failed',
        details: errorText 
      });
    }

    const result = await response.json();
    
    // Clean up temp file
    fs.unlinkSync(audioFile.filepath);

    return res.status(200).json({
      text: result.text,
      duration: result.duration,
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
