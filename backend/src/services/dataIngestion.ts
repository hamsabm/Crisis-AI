import axios from 'axios';
import { Alert } from '../models/Alert.js';
import { io } from '../index.js';
import mongoose from 'mongoose';

const USGS_URL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson';

const processedCache = new Set();

export async function fetchUSGSEarthquakes() {
  try {
    const response = await axios.get(USGS_URL);
    const features = response.data.features;
    
    for (const feature of features) {
      const { id, properties, geometry } = feature;
      const mag = properties.mag;
      const title = properties.title;
      const [lng, lat] = geometry.coordinates;

      if (mag < 2.5) continue; 
      if (processedCache.has(id)) continue;
      processedCache.add(id);
      
      let severity = 'low';
      if (mag >= 4.5) severity = 'medium';
      if (mag >= 6.0) severity = 'high';
      if (mag >= 7.5) severity = 'critical';

      const newAlert = new Alert({
        title: `USGS WebHook: ${title}`,
        description: `Magnitude ${mag} earthquake detected automatically via USGS Satellite feed. Tsunami warning status: ${properties.tsunami ? 'Active' : 'Negative'}.`,
        type: 'earthquake',
        severity,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
          region: properties.place || 'Unknown Region',
          country: 'Global'
        },
        affectedRadius: Math.max(mag * 10, 10),
        source: {
          type: 'api',
          reference: id,
          confidence: 0.98
        }
      });

      if (mongoose.connection.readyState === 1) {
        const existing = await Alert.findOne({ 'source.reference': id });
        if (!existing) {
          await newAlert.save();
          console.log(`[Data Ingestion] Broadcasted USGS Alert: ${title}`);
          io.emit('alert:new', newAlert);
        }
      }
    }
  } catch (error) {
    console.warn('[Data Ingestion] USGS fetch warning:', error.message);
  }
}

export function startDataIngestion() {
  console.log('[Data Ingestion] Daemon started. Polling USGS every 5 minutes.');
  fetchUSGSEarthquakes();
  // Poll every 5 minutes
  setInterval(fetchUSGSEarthquakes, 5 * 60 * 1000);
}
