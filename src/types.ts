export interface FocalPoint {
  id: string;
  name: string;
  x: number; // 0 to 100 percentage
  y: number; // 0 to 100 percentage
  zoom: number; // 1.5 to 8
  category: 'symbolism' | 'brushwork' | 'light' | 'composition' | 'hidden_detail' | 'figure' | 'color theory';
  shortDescription: string;
  curatorInsight: string;
  suggestedPrompt: string;
}

export interface TourStop {
  stopNumber: number;
  title: string;
  x: number;
  y: number;
  zoom: number;
  narrative: string;
  focusKey: string;
}

export interface GuidedTour {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  durationMinutes: number;
  stops: TourStop[];
}

export interface ColorSwatch {
  hex: string;
  name: string;
  role: string;
}

export interface Artwork {
  id: string;
  title: string;
  originalTitle?: string;
  artist: string;
  year: string;
  period: string;
  medium: string;
  dimensions: string;
  location: string;
  imageUrl: string;
  backupImageUrl?: string;
  aspectRatio: number; // width / height
  description: string;
  curatorOverview: string;
  colorPalette: ColorSwatch[];
  focalPoints: FocalPoint[];
  tours: GuidedTour[];
  suggestedQuestions: string[];
}
