
import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData } from "../types";

const SYSTEM_INSTRUCTION = `You are a high-accuracy Professional Intelligence Agent. Your goal is to extract ALL contact and career data from LinkedIn profiles with extreme precision.

CRITICAL EXTRACTION RULES:
1. ASSOCIATION: Ensure that the primary "fullName" is correctly associated with the "phoneNumbers" and "emails" found. If a specific number is mentioned as a direct line for the individual, prioritize it.
2. MULTIPLE ENTRIES: Scour every visible section (Summary, About, Contact Info, Experience) for multiple email addresses and phone numbers. Capture EVERY unique entry you find.
3. SEARCH GROUNDING: When provided a URL, use the googleSearch tool to find the profile's public details, looking specifically for "Email:", "Contact:", "Direct:", "Mobile:", and symbols like "@" or "+" followed by digits.
4. IDENTIFICATION: Correct name, title, and organization are mandatory.
5. ZERO HALLUCINATION: If no email/phone is found, return an empty array []. Never make up data.
6. FORMAT: Return a strictly valid JSON object matching the provided schema.`;

export const extractProfileDataFromImage = async (base64Image: string): Promise<ExtractedData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image.split(',')[1],
          },
        },
        { text: "Extract all professional info. Ensure the name and primary contact number are correctly identified and linked. Return as JSON." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          emails: { type: Type.ARRAY, items: { type: Type.STRING } },
          phoneNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedinUrl: { type: Type.STRING },
          summary: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
        },
        required: ["fullName", "confidenceScore"]
      },
    },
  });

  return JSON.parse(response.text || '{}') as ExtractedData;
};

export const extractProfileDataFromUrl = async (url: string): Promise<ExtractedData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Research this LinkedIn profile: ${url}. 
  Exhaustively find every listed email address and phone number for this specific person. Check the 'About' section for direct contact lines. 
  Link the name ${url.split('/').pop()} directly to any contact numbers discovered.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fullName: { type: Type.STRING },
          emails: { type: Type.ARRAY, items: { type: Type.STRING } },
          phoneNumbers: { type: Type.ARRAY, items: { type: Type.STRING } },
          jobTitle: { type: Type.STRING },
          company: { type: Type.STRING },
          location: { type: Type.STRING },
          linkedinUrl: { type: Type.STRING },
          summary: { type: Type.STRING },
          confidenceScore: { type: Type.NUMBER },
        },
        required: ["fullName", "confidenceScore"]
      },
    },
  });

  const data = JSON.parse(response.text || '{}');
  if (!data.linkedinUrl) data.linkedinUrl = url;
  
  return data as ExtractedData;
};
