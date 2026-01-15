// Core data types for the CRM
export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  title?: string;
  slug?: string;
  initials?: string;
  tags?: string[];
  isQuickContact?: boolean;
  lastContact?: string;
  nextMeetDate?: string | null;
  profileFields?: any;
  personalNotes?: string;
  shareToken?: string | null;
  isShared?: boolean;
  daysAgo?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  title?: string;
  tags?: string[];
  isQuickContact?: boolean;
  profileFields?: any;
  personalNotes?: string;
  lastContact?: string;
  nextMeetDate?: string | null;
  shareToken?: string | null;
  isShared?: boolean;
}

export interface UpdateContactInput extends Partial<CreateContactInput> {
  id: string;
}
