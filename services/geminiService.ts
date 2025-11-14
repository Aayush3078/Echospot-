import { GoogleGenAI } from '@google/genai';
import type { Location, Source, Place, PlaceCategory } from '../types';

function parseGeminiResponse(text: string): Place[] {
  if (!text || typeof text.split !== 'function') {
    console.error("Received invalid text format from API:", text);
    return [];
  }
  
  const places: Place[] = [];
  const introAndPlaces = text.split('###');
  const sections = introAndPlaces.length > 1 ? introAndPlaces.slice(1) : introAndPlaces;
  
  const coordsRegex = /\[lat:\s*(-?\d+(?:\.\d+)?),\s*lng:\s*(-?\d+(?:\.\d+)?)\]/;
  const categoryRegex = /\[category:\s*(\w+)\s*\]/;
  const ratingRegex = /\[rating:\s*(\d(?:\.\d)?)\s*\]/;

  for (const section of sections) {
    if (section.trim() === '') continue;

    try {
      const coordsMatch = section.match(coordsRegex);
      const categoryMatch = section.match(categoryRegex);
      const ratingMatch = section.match(ratingRegex);
      
      if (coordsMatch) {
        const lines = section.trim().split('\n');
        const name = lines[0].replace(/\*/g, '').trim();
        
        const descriptionWithExtras = lines.slice(1).join(' ').trim();
        const description = descriptionWithExtras.replace(coordsRegex, '').replace(categoryRegex, '').replace(ratingRegex, '').trim();
        
        const lat = parseFloat(coordsMatch[1]);
        const lng = parseFloat(coordsMatch[2]);
        const category = (categoryMatch ? categoryMatch[1].toLowerCase() : 'other') as PlaceCategory;
        const estimatedRating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;

        if (name && description && !isNaN(lat) && !isNaN(lng)) {
           places.push({ name, description, lat, lng, category, estimatedRating });
        }
      }
    } catch (e) {
      console.error("Failed to parse a place section:", section, e);
      // Continue to the next section even if one fails
    }
  }
  return places;
}

export async function findHiddenGems(prompt: string, location: Location | null, locationQuery: string) {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set. Please ensure it is configured.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';
  
  const locationContext = locationQuery 
    ? `near "${locationQuery}"` 
    : (location ? `near the user's current location` : '');

  const fullPrompt = `Find at least 10-15 hidden places that are calm and less populated, with good views or food, where guests can relax ${locationContext}. The user is looking for: "${prompt}".

Your primary goal is to act as a savvy local guide. Use your search tools to find personal recommendations and unique suggestions from Google Maps, Reddit, Quora, and travel blogs.

For each place you find, you MUST provide an estimated rating. To do this, synthesize information from Google ratings, Reddit discussions, and Quora answers. Provide this as an "estimated rating" on a scale of 1.0 to 5.0, with one decimal place. If explicit ratings aren't available, make a reasonable estimate based on the overall sentiment and descriptions you find online.

Start with a one or two paragraph introduction to the places you found, then list the places.

For each place, categorize it into ONE of the following: food, view, tranquility, park, cafe, scenic, other.

IMPORTANT: For each place you suggest, you MUST format it exactly like this example, including the category, rating, and coordinate formatting:
### **Name of the Place**
A one or two-sentence description of why this place is a hidden gem, citing information from your search if relevant.
[category: food]
[rating: 4.7]
[lat: 34.0522, lng: -118.2437]
`;
  
  const toolConfig = location ? {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
  } : undefined;

  const response = await ai.models.generateContent({
    model,
    contents: fullPrompt,
    config: {
      tools: [{ googleMaps: {} }, { googleSearch: {} }],
    },
    toolConfig,
  });

  const text = response.text || '';
  const places = parseGeminiResponse(text);

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  const sources: Source[] = [];
  for (const chunk of groundingChunks) {
    if (chunk.maps && chunk.maps.uri && chunk.maps.title) {
        sources.push({
            uri: chunk.maps.uri,
            title: chunk.maps.title,
            type: 'maps'
        });
    }
    if (chunk.web && chunk.web.uri && chunk.web.title) {
        sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title,
            type: 'web'
        });
    }
  }
  
  const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

  return { text, sources: uniqueSources, places };
}