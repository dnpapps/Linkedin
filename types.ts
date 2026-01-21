
export interface ExtractedData {
  fullName: string | null;
  emails: string[];
  phoneNumbers: string[];
  jobTitle: string | null;
  company: string | null;
  location: string | null;
  linkedinUrl: string | null;
  summary: string | null;
  confidenceScore: number;
}

export enum ExtractionStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
