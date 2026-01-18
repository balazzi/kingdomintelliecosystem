
// Guidelines followed: Using Type and Modality from @google/genai
import { GoogleGenAI, Type, Modality } from "@google/genai";

/**
 * Standard content generation using the environment's primary API key.
 */
export const generateDailyDevotional = async (language: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a daily Christian devotional in ${language}. Include a Title, Scripture Reference, Message (approx 200 words), Application, and a closing Prayer. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          scripture: { type: Type.STRING },
          content: { type: Type.STRING },
          application: { type: Type.STRING },
          prayer: { type: Type.STRING }
        },
        required: ["title", "scripture", "content", "application", "prayer"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const generatePrayerResponse = async (request: string, language: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `A person is asking for prayer for: "${request}". In ${language}, provide a compassionate biblical response, a relevant scripture with reference, and a powerful prayer. Return as JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          scripture: {
            type: Type.OBJECT,
            properties: {
              reference: { type: Type.STRING },
              text: { type: Type.STRING }
            },
            required: ["reference", "text"]
          },
          prayer: { type: Type.STRING }
        },
        required: ["message", "scripture", "prayer"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const textToSpeech = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with deep compassion and peace: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// --- Creative Content Services ---

/**
 * Generates visuals using Gemini 3 Pro Image models for 4K and Ultra-HD quality.
 * Includes fallback logic to ensure user always gets a visual.
 */
export const generateHighQualityImage = async (
  prompt: string, 
  aspectRatio: "1:1" | "4:3" | "3:4" | "16:9" | "9:16",
  resolution: "1K" | "2K" | "4K" | "6K" | "8K" = "1K"
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const apiRes = (resolution === "6K" || resolution === "8K") ? "4K" : resolution as "1K" | "2K" | "4K";
    const qualityBoost = `, biblical masterpiece, hyper-photorealistic cinematic detail, epic lighting, sacred atmosphere, divine presence, extremely detailed textures, 8k resolution style, shot on 35mm lens, f/1.8, voluminous lighting, sharp focus`;
    const finalPrompt = `${prompt}${qualityBoost}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: finalPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: apiRes
        },
        tools: [{ google_search: {} }]
      },
    });
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error: any) {
    console.warn("Pro Image Gen failed, falling back to Flash Image engine...");
    try {
      const fallbackAi = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fallbackResponse = await fallbackAi.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt + ", cinematic, realistic biblical art" }] },
      });
      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    } catch (e) {
      console.error("Critical: Fallback visual engine failed.");
    }
    throw error;
  }
  return null;
};

/**
 * Generates video using Veo model with polling.
 */
export const generateVeoVideo = async (prompt: string, imageBase64: string) => {
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    throw new Error("KEY_RESET_REQUIRED");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
  const mimeType = imageBase64.match(/data:([^;]+);/)?.[1] || 'image/png';

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: { imageBytes: base64Data, mimeType: mimeType },
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return downloadLink ? `${downloadLink}&key=${process.env.API_KEY}` : null;
};

/**
 * Wisdom Chat using Search Grounding.
 * Stricter instructions for scripture and historical data.
 */
export const askWisdomAssistant = async (query: string, useSearch: boolean = true) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config: any = {
    systemInstruction: `You are the Kingdom Intelligence Wisdom Assistant. 
    Mission: Provide 4K-level clarity on biblical and spiritual topics. 
    Absolute Requirement: You MUST ALWAYS include at least 5-7 specific scripture verses with their full text for every query.
    Instructions:
    - Format scriptures clearly in a separate block with a border or as bold citations.
    - If explaining a book of the Bible like "Hebrews", provide a chapter-by-chapter breakdown and core theological themes.
    - Use scholarly but accessible language.
    - Ensure historical context is grounded in archaeological evidence where applicable.`
  };

  if (useSearch) config.tools = [{ googleSearch: {} }];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: config,
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * Geographical study with Maps grounding.
 */
export const searchMapGrounding = async (location: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const tools: any[] = [{ googleMaps: {} }, { googleSearch: {} }];
  const toolConfig: any = {};
  
  if (lat && lng) {
    toolConfig.retrievalConfig = { latLng: { latitude: lat, longitude: lng } };
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Analyze the biblical, archaeological, and geographical significance of: ${location}. Provide active links to maps and historical data. Describe the location as it was in ancient times and as it is today.`,
    config: { tools, toolConfig },
  });

  return {
    text: response.text,
    grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

/**
 * Image and Video Understanding.
 */
export const analyzeVisual = async (prompt: string, fileData: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: fileData.split(',')[1] || fileData, mimeType } },
        { text: prompt },
      ],
    },
  });
  return response.text;
};

// --- Helper Functions ---

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
