export type MediaType = 'stills' | 'motion';
export type ProjectCategory = 'editorial' | 'campaign' | 'personal' | 'events' | 'commercial';
export type ViewMode = 'slider' | 'stills' | 'list';
export type FilterType = 'all' | 'stills' | 'motion' | 'editorial' | 'campaign' | 'personal';
export type CurveMode = 'arch' | 'arc' | 'cylinder' | 'off';

export interface CameraMetadata {
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: string;
  year: string;
  location: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  client?: string;
  type: MediaType;
  tag: ProjectCategory;
  count: number;
  duration?: number; // for video in seconds
  image: string;
  gallery: string[];
  video?: string;
  isReel?: boolean;
  alt: string;
  description: string;
  meta: CameraMetadata;
}

export interface StudioInfo {
  title: string;
  tagline: string;
  bio: string;
  since: string;
  location: string;
  email: string;
  phone?: string;
  instagram: string;
  services: string[];
  trustedClients: { name: string; slug: string; category?: string }[];
}
