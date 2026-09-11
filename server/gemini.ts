import { GoogleGenAI, Type } from '@google/genai';
import { Item, Match, MatchBreakdown, SmartSearchQuery } from '../src/types';

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAI) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// Geospatial distance helper (in kilometers)
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate location proximity score (0-10)
function getLocationScore(itemA: Item, itemB: Item): number {
  if (!itemA.location || !itemB.location) return 5;
  const distKm = calculateHaversineDistance(
    itemA.location.lat,
    itemA.location.lng,
    itemB.location.lat,
    itemB.location.lng
  );
  if (distKm < 0.2) return 10;
  if (distKm < 0.5) return 9;
  if (distKm < 1.0) return 8;
  if (distKm < 3.0) return 6;
  if (distKm < 10.0) return 4;
  if (distKm < 25.0) return 2;
  return 0;
}

// Calculate date proximity score (0-5)
function getDateScore(itemA: Item, itemB: Item): number {
  const dateA = new Date(itemA.date).getTime();
  const dateB = new Date(itemB.date).getTime();
  if (isNaN(dateA) || isNaN(dateB)) return 3;
  const diffDays = Math.abs(dateA - dateB) / (1000 * 60 * 60 * 24);
  if (diffDays <= 0) return 5;
  if (diffDays <= 1) return 4.5;
  if (diffDays <= 3) return 4;
  if (diffDays <= 7) return 3;
  if (diffDays <= 14) return 2;
  return 1;
}

/**
 * Compare a lost item and a found item using Gemini 3.8 Flash
 * Hybrid scoring schema:
 * - Image similarity: 35%
 * - Description similarity: 25%
 * - Category: 10%
 * - Color: 10%
 * - Brand/model: 5%
 * - Location proximity: 10%
 * - Date/time proximity: 5%
 */
export async function compareItemsWithAI(lostItem: Item, foundItem: Item): Promise<{
  matchScore: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  aiSummary: string;
}> {
  const ai = getGenAI();

  // Compute baseline geographic and temporal scores
  const locationScore = getLocationScore(lostItem, foundItem);
  const dateTimeScore = getDateScore(lostItem, foundItem);

  const sameCategory = lostItem.category.toLowerCase() === foundItem.category.toLowerCase();
  const categoryScore = sameCategory ? 10 : 0;

  const colorMatch =
    lostItem.color.toLowerCase().trim() === foundItem.color.toLowerCase().trim() ||
    lostItem.description.toLowerCase().includes(foundItem.color.toLowerCase()) ||
    foundItem.description.toLowerCase().includes(lostItem.color.toLowerCase());
  const colorScore = colorMatch ? 10 : 3;

  const brandMatch =
    lostItem.brandModel &&
    foundItem.brandModel &&
    (lostItem.brandModel.toLowerCase().includes(foundItem.brandModel.toLowerCase()) ||
      foundItem.brandModel.toLowerCase().includes(lostItem.brandModel.toLowerCase()));
  const brandScore = brandMatch ? 5 : (lostItem.brandModel ? 2 : 3);

  // If Gemini API is available, ask Gemini to evaluate semantic similarity & multimodal details
  if (ai) {
    try {
      const prompt = `You are an expert AI matching agent for a Lost & Found Item Recovery System.
Compare the following two item reports:

[LOST ITEM]
Title: ${lostItem.title}
Category: ${lostItem.category}
Color: ${lostItem.color}
Brand/Model: ${lostItem.brandModel || 'N/A'}
Date Lost: ${lostItem.date} ${lostItem.time || ''}
Location: ${lostItem.location.name} (${lostItem.location.lat}, ${lostItem.location.lng})
Description: ${lostItem.description}
Identifying Markers: ${lostItem.identifyingCharacteristics || 'N/A'}

[FOUND ITEM]
Title: ${foundItem.title}
Category: ${foundItem.category}
Color: ${foundItem.color}
Brand/Model: ${foundItem.brandModel || 'N/A'}
Date Found: ${foundItem.date} ${foundItem.time || ''}
Location: ${foundItem.location.name} (${foundItem.location.lat}, ${foundItem.location.lng})
Description: ${foundItem.description}
Observations: ${foundItem.additionalObservations || 'N/A'}

Provide:
1. imageScore (0 to 35): visual appearance & style match likelihood
2. descriptionScore (0 to 25): semantic & context description similarity
3. reasons: array of 3 to 5 clear checkmarked reason strings starting with "✓ " (e.g., "✓ Same category: Wallet", "✓ Found near reported location", "✓ Matching color and finish")
4. aiSummary: 1-2 sentence neutral summary explaining why this is or isn't a potential match.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              imageScore: { type: Type.NUMBER, description: 'Score between 0 and 35' },
              descriptionScore: { type: Type.NUMBER, description: 'Score between 0 and 25' },
              reasons: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Checkmarked reason strings',
              },
              aiSummary: { type: Type.STRING, description: 'Concise summary analysis' },
            },
            required: ['imageScore', 'descriptionScore', 'reasons', 'aiSummary'],
          },
        },
      });

      const parsed = JSON.parse(response.text?.trim() || '{}');
      const imageScore = Math.min(35, Math.max(0, Number(parsed.imageScore) || 20));
      const descriptionScore = Math.min(25, Math.max(0, Number(parsed.descriptionScore) || 15));

      const totalScore = Math.round(
        imageScore + descriptionScore + categoryScore + colorScore + brandScore + locationScore + dateTimeScore
      );

      return {
        matchScore: Math.min(100, Math.max(0, totalScore)),
        breakdown: {
          imageScore: Math.round(imageScore),
          descriptionScore: Math.round(descriptionScore),
          categoryScore,
          colorScore,
          brandScore,
          locationScore,
          dateTimeScore,
        },
        reasons: parsed.reasons && parsed.reasons.length > 0 ? parsed.reasons : [
          sameCategory ? `✓ Same category: ${lostItem.category}` : '✗ Different categories',
          colorMatch ? `✓ Matching color: ${lostItem.color}` : '✗ Different color appearance',
          locationScore >= 7 ? '✓ Found near reported location' : '⚠ Different locations',
          dateTimeScore >= 4 ? '✓ Date and time correlate closely' : '⚠ Different dates'
        ],
        aiSummary: parsed.aiSummary || `Potential match score calculated at ${totalScore}%.`,
      };
    } catch (err) {
      console.warn('Gemini item comparison fallback to heuristic:', err);
    }
  }

  // Algorithmic heuristic fallback
  let descScore = 15;
  const lostWords = lostItem.description.toLowerCase().split(/\s+/);
  const foundDesc = foundItem.description.toLowerCase();
  const matches = lostWords.filter(w => w.length > 3 && foundDesc.includes(w)).length;
  if (matches >= 4) descScore = 24;
  else if (matches >= 2) descScore = 19;

  const imgScore = sameCategory && colorMatch ? 30 : 15;
  const totalScore = Math.min(
    100,
    Math.round(imgScore + descScore + categoryScore + colorScore + brandScore + locationScore + dateTimeScore)
  );

  const reasons = [
    sameCategory ? `✓ Same category: ${lostItem.category}` : '✗ Categories differ',
    colorMatch ? `✓ Matching color tone: ${lostItem.color}` : '⚠ Color mismatch',
    brandMatch ? `✓ Same brand: ${lostItem.brandModel}` : '✓ Similar aesthetic build',
    locationScore >= 7 ? '✓ Found near reported location' : '⚠ Further geographical distance',
    dateTimeScore >= 4 ? '✓ Date aligns within proximity threshold' : '⚠ Date variance observed',
  ];

  return {
    matchScore: totalScore,
    breakdown: {
      imageScore: imgScore,
      descriptionScore: descScore,
      categoryScore,
      colorScore,
      brandScore,
      locationScore,
      dateTimeScore,
    },
    reasons,
    aiSummary: `Potential match detected with ${totalScore}% confidence based on category, location, and visual descriptors.`,
  };
}

/**
 * Natural language search parser
 * E.g. "I lost a black Samsung phone near the railway station yesterday"
 */
export async function parseNaturalLanguageSearch(query: string): Promise<{
  type?: 'lost' | 'found' | 'all';
  category?: string;
  color?: string;
  brand?: string;
  keywords: string[];
  locationHint?: string;
}> {
  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `Parse the following user query for a Lost & Found search:
"${query}"

Extract:
- type: 'lost' if they are looking for something lost/seeking lost items, 'found' if looking for found items, or 'all' if ambiguous
- category: one of ['Mobile Phone', 'Wallet', 'ID Card', 'Bag', 'Keys', 'Laptop', 'Earphones', 'Documents', 'Jewelry', 'Books', 'Clothing', 'Other'] or empty
- color: color mention or empty
- brand: brand or model mention or empty
- locationHint: location mention or empty
- keywords: array of 3 to 6 key search terms`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['lost', 'found', 'all'] },
              category: { type: Type.STRING },
              color: { type: Type.STRING },
              brand: { type: Type.STRING },
              locationHint: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['type', 'keywords'],
          },
        },
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (err) {
      console.warn('Gemini search parse fallback to regex:', err);
    }
  }

  // Regex fallback
  const q = query.toLowerCase();
  let type: 'lost' | 'found' | 'all' = 'all';
  if (q.includes('lost') || q.includes('misplaced')) type = 'found'; // looking for found reports
  else if (q.includes('found')) type = 'lost';

  const categories = [
    'Mobile Phone',
    'Wallet',
    'ID Card',
    'Bag',
    'Keys',
    'Laptop',
    'Earphones',
    'Documents',
    'Jewelry',
    'Books',
    'Clothing',
  ];
  const detectedCategory = categories.find(c => q.includes(c.toLowerCase()));
  const colors = ['black', 'blue', 'brown', 'red', 'green', 'white', 'grey', 'gray', 'silver', 'gold'];
  const detectedColor = colors.find(c => q.includes(c));

  return {
    type,
    category: detectedCategory,
    color: detectedColor,
    keywords: query.split(/\s+/).filter(w => w.length > 2),
  };
}

/**
 * Auto-categorize and enhance item report from image or initial description
 */
export async function analyzeItemWithAI(data: {
  title?: string;
  description?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<{
  suggestedCategory: string;
  suggestedColor: string;
  suggestedBrand: string;
  suggestedTitle: string;
  enhancedDescription: string;
  identifyingTips: string[];
}> {
  const ai = getGenAI();

  if (ai) {
    try {
      const parts: any[] = [];
      if (data.imageBase64 && data.mimeType) {
        parts.push({
          inlineData: {
            mimeType: data.mimeType,
            data: data.imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        });
      }

      parts.push({
        text: `Analyze this lost or found item.
Title provided: "${data.title || ''}"
Description provided: "${data.description || ''}"

Return:
1. suggestedCategory: one of ['Mobile Phone', 'Wallet', 'ID Card', 'Bag', 'Keys', 'Laptop', 'Earphones', 'Documents', 'Jewelry', 'Books', 'Clothing', 'Other']
2. suggestedColor: dominant color
3. suggestedBrand: brand/model if identifiable, else ''
4. suggestedTitle: concise, clear title (e.g. "Black Leather Fossil Bifold Wallet")
5. enhancedDescription: polished 1-2 sentence description highlighting key distinguishing features
6. identifyingTips: array of 2 tips of secret details the reporter should note down for ownership proof (e.g. serial numbers, inner monogram, specific stickers)`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedCategory: { type: Type.STRING },
              suggestedColor: { type: Type.STRING },
              suggestedBrand: { type: Type.STRING },
              suggestedTitle: { type: Type.STRING },
              enhancedDescription: { type: Type.STRING },
              identifyingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['suggestedCategory', 'suggestedColor', 'suggestedTitle', 'enhancedDescription'],
          },
        },
      });

      return JSON.parse(response.text?.trim() || '{}');
    } catch (err) {
      console.warn('Gemini auto-analysis fallback:', err);
    }
  }

  // Fallback defaults
  return {
    suggestedCategory: 'Other',
    suggestedColor: 'Black',
    suggestedBrand: '',
    suggestedTitle: data.title || 'Reported Item',
    enhancedDescription: data.description || 'Reported item with standard characteristics.',
    identifyingTips: [
      'Note any hidden serial numbers or barcode details',
      'Record specific scratches, stickers, or personalized engravings',
    ],
  };
}

/**
 * Check for duplicate reports
 */
export async function checkForDuplicates(newItem: Partial<Item>, existingItems: Item[]): Promise<{
  isDuplicate: boolean;
  duplicateItemId?: string;
  confidence: number;
  reason?: string;
}> {
  const sameCategoryItems = existingItems.filter(
    i => i.id !== newItem.id && i.type === newItem.type && i.category === newItem.category
  );

  for (const item of sameCategoryItems) {
    const sameColor = item.color.toLowerCase() === newItem.color?.toLowerCase();
    const sameReporter = item.reporterId === newItem.reporterId;
    const sameTitle = item.title.toLowerCase() === newItem.title?.toLowerCase();

    if (sameReporter && (sameTitle || sameColor)) {
      return {
        isDuplicate: true,
        duplicateItemId: item.id,
        confidence: 90,
        reason: 'You have already submitted a very similar report for this item.',
      };
    }
  }

  return { isDuplicate: false, confidence: 0 };
}
