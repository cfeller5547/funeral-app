// Gemini AI client
export { geminiModel, geminiProModel, genAI } from './gemini'

// AI Intake Copilot - Extract case data from notes
export {
  parseIntakeNotes,
  parseIntakeWithImages,
  type ExtractedCaseData,
  type ExtractedDecedent,
  type ExtractedContact,
  type ExtractedService,
} from './intake-parser'

// Document Analyzer - OCR + Smart Filing
export {
  analyzeDocument,
  analyzeDocuments,
  type DocumentAnalysis,
  type DocumentTag,
} from './document-analyzer'

// Ops Triage Copilot - Messages → Tasks
export {
  triageOpsMessage,
  triageMultipleMessages,
  type OpsTriageResult,
  type ExtractedTask,
  type ExtractedStatusUpdate,
  type ExtractedCaseUpdate,
} from './ops-triage'

// Email Parser - Inbound email analysis
export {
  parseInboundEmail,
  type ParsedEmail,
} from './email-parser'
