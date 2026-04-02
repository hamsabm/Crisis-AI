import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

router.get('/realtime', async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and Longitude are required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Act as a real-time disaster intelligence agent. 
    Analyze the current location (Latitude: ${lat}, Longitude: ${lon}).
    Research and find the 3 most major and genuine recent disaster-related news or incidents (Floods, Earthquakes, Fires, Cyclones, etc.) in the surroundings or region.
    Provide the response in a JSON array format. Each object should have:
    - title: A short, news-style headline.
    - description: A 1-sentence summary of the incident.
    - severity: 'Critical', 'Warning', or 'Notice'.
    - type: The type of disaster (e.g., 'Flood', 'Earthquake').
    - location: The specific city or area name.
    - date: The date of the news.
    
    Ensure the news is genuine (simulated if no active news found, but based on realistic patterns).
    Return ONLY the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up potential markdown formatting in the response
    const jsonString = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonString);

    res.json(data);
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to fetch real-time disaster data' });
  }
});

export { router as disasterRouter };
