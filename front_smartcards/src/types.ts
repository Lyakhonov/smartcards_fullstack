export type Flashcard = {
  id?: number;
  question: string;
  answer: string;
};

export type Group = {
  id: number;
  filename: string;
  created_at: string;
  flashcards_count?: number;
  file_url?: string;
};

export type LoginResponse = {
  access_token: string;
};
