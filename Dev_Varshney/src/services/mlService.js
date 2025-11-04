import axios from 'axios';

const ML_URL = process.env.ML_SERVICE_URL;
const ML_KEY = process.env.ML_API_KEY || '';

export async function sendSubmissionToML(payload) {
  try {
    if (!ML_URL) return null;
    await axios.post(`${ML_URL}/api/v1/analyze/submission`, payload, {
      headers: { 'x-api-key': ML_KEY },
      timeout: 10000
    });
    return true;
  } catch (err) {
    console.error('ML send error:', err.message);
    return null;
  }
}
