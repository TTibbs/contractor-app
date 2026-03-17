export interface Job {
  id: string;
  title: string;
  clientName: string;
  address: string;
  description: string;
  price?: number;
  status: "pending" | "in_progress" | "completed";
  synced: boolean;
  vatIncluded?: boolean;
  taxRate?: number;
  paid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  jobId: string;
  text: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  jobId: string;
  uri: string;
  createdAt: string;
}

export interface Signature {
  id: string;
  jobId: string;
  uri: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  jobId: string | null;
  category: string | null;
  amount: number;
  note: string | null;
  createdAt: string;
}

export interface JobWithDetails extends Job {
  notes: Note[];
  photos: Photo[];
}
