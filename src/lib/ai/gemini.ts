import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Use Gemini 1.5 Flash for speed and cost efficiency
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.2, // Lower temperature for more consistent extraction
    topP: 0.8,
    maxOutputTokens: 4096,
  },
})

// Use Gemini 1.5 Pro for complex tasks (OCR, document analysis)
export const geminiProModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro',
  generationConfig: {
    temperature: 0.1,
    topP: 0.8,
    maxOutputTokens: 8192,
  },
})

export { genAI }
