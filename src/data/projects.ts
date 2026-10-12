import { Project, StudioInfo } from '../types';

// Hero Videos from src/assets/Hero Videos
import ashianaAmodhVideo from '../assets/Hero Videos/Ashiana Amodh.mp4';
import atmosphereVideo from '../assets/Hero Videos/Atmosphere.mp4';
import avicoreVideo from '../assets/Hero Videos/Avicore.mp4';
import avicore2Video from '../assets/Hero Videos/Avicore2.mp4';
import avicore3Video from '../assets/Hero Videos/Avicore3.mp4';
import avicore4Video from '../assets/Hero Videos/Avicore4.mp4';
import cafeVideo from '../assets/Hero Videos/cafe.mp4';
import fiddlecraftVideo from '../assets/Hero Videos/fiddlecraft.mp4';
import starfishVideo from '../assets/Hero Videos/Starfish Showreel.mp4';
import titanVideo from '../assets/Hero Videos/titan.mp4';

// Hero Covers from src/assets/Hero Covers (High-Performance WebP)
import ashianaAmodhCover from '../assets/Hero Covers/Ashiana Amodh.webp';
import atmosphereCover from '../assets/Hero Covers/atmostphere.webp';
import avicore1Cover from '../assets/Hero Covers/Avicore1.webp';
import avicore2Cover from '../assets/Hero Covers/Avicore2.webp';
import avicore3Cover from '../assets/Hero Covers/Avicore3.webp';
import avicore4Cover from '../assets/Hero Covers/Avicore4.webp';
import cafeCover from '../assets/Hero Covers/cafe.webp';
import fiddlecraftCover from '../assets/Hero Covers/fiddlecraft.webp';
import starfishCover from '../assets/Hero Covers/Starfish.webp';
import titanCover from '../assets/Hero Covers/titan.webp';

// Stills from src/assets/Stills (High-Performance WebP)
import stillHome from '../assets/Stills/Home.webp';
import still2 from '../assets/Stills/2.webp';
import still3 from '../assets/Stills/3.webp';
import still4 from '../assets/Stills/4.webp';
import still5 from '../assets/Stills/5.webp';
import still25 from '../assets/Stills/25.webp';
import still28 from '../assets/Stills/28.webp';
import still29 from '../assets/Stills/29.webp';
import still30 from '../assets/Stills/30.webp';
import still31 from '../assets/Stills/31.webp';
import still32 from '../assets/Stills/32.webp';
import still33 from '../assets/Stills/33.webp';
import still34 from '../assets/Stills/34.webp';
import still35 from '../assets/Stills/35.webp';
import still36 from '../assets/Stills/36.webp';
import still37 from '../assets/Stills/37.webp';

export const STUDIO_INFO: StudioInfo = {
  title: 'ODD MANGO',
  tagline: 'documenting emotion, movement and meaning.',
  bio: 'A boutique production studio with unyielding passion for storytelling. Photography and film documenting emotion, movement and meaning — for brands and culture.',
  since: '2016',
  location: 'Pune, Maharashtra',
  email: 'oddmangomedia@gmail.com',
  phone: '+91 93706 02824',
  instagram: '@oddmango',
  services: [
    'Brand Films',
    'Social Media Content',
    'Commercials & Campaigns',
    'Product & Lifestyle Films',
    'Corporate & Institutional Films',
    'Photography & Creative Design'
  ],
  trustedClients: [
    { name: 'Aston Martin', slug: 'aston-martin', category: 'Automotive' },
    { name: 'Vans', slug: 'vans', category: 'Skate & Street' },
    { name: 'Under Armour', slug: 'under-armour', category: 'Performance' },
    { name: 'Nike', slug: 'nike', category: 'Sportswear' },
    { name: 'Adidas', slug: 'adidas', category: 'Sportswear' },
    { name: 'Puma', slug: 'puma', category: 'Sportswear' },
    { name: 'Netflix', slug: 'netflix', category: 'Entertainment' },
    { name: 'Red Bull', slug: 'redbull', category: 'Beverage & Culture' },
    { name: 'Crocs', slug: 'crocs', category: 'Footwear' },
    { name: 'New Balance', slug: 'new-balance', category: 'Footwear' },
    { name: 'Glenfiddich', slug: 'glenfiddich', category: 'Luxury Spirits' },
    { name: 'Johnnie Walker', slug: 'johnnie-walker', category: 'Luxury Spirits' },
    { name: 'Maybelline', slug: 'maybelline', category: 'Beauty' },
    { name: 'Fujifilm', slug: 'fujifilm', category: 'Imaging' }
  ]
};

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: 'Omkar Janvekar',
    role: 'Founder & Creative Director',
    email: 'oddmangomedia@gmail.com',
    phone: '+91 93706 02824'
  }
];

export const PROJECTS: Project[] = [
  // 1. Ashiana Amodh
  {
    id: '1',
    slug: 'ashiana-amodh',
    name: 'Ashiana Amodh',
    client: 'Ashiana Amodh',
    type: 'motion',
    tag: 'commercial',
    count: 12,
    duration: 17,
    image: ashianaAmodhCover,
    video: ashianaAmodhVideo,
    gallery: [ashianaAmodhCover],
    alt: 'Ashiana Amodh luxury architectural and design motion film',
    description: 'Architectural serenity and luxurious spatial design captured through high-definition motion.',
    meta: {
      camera: 'RED V-Raptor 8K VV',
      lens: 'Leitz Hugo 50mm T1.5',
      aperture: 'T2.0',
      shutter: '1/48s',
      iso: '800',
      year: '2024',
      location: 'Ashiana Amodh Estate'
    }
  },
  // 2. Atmosphere
  {
    id: '2',
    slug: 'atmosphere',
    name: 'Atmosphere',
    client: 'Atmosphere',
    type: 'motion',
    tag: 'commercial',
    count: 15,
    duration: 102,
    image: atmosphereCover,
    video: atmosphereVideo,
    gallery: [atmosphereCover],
    alt: 'Atmosphere commercial campaign capturing architectural ambiance and lifestyle',
    description: 'Expansive commercial direction highlighting luxury retail architecture, daylight interaction, and curated consumer experience.',
    meta: {
      camera: 'ARRI Alexa Mini LF',
      lens: 'Cooke S4/i 32mm',
      aperture: 'T2.0',
      shutter: '1/48s',
      iso: '800',
      year: '2024',
      location: 'Retail Flagship'
    }
  },
  // 3. Avicore 1
  {
    id: '3',
    slug: 'avicore-1',
    name: 'Avicore 1',
    client: 'Avicore Dynamics',
    type: 'motion',
    tag: 'commercial',
    count: 9,
    duration: 11,
    image: avicore1Cover,
    video: avicoreVideo,
    gallery: [avicore1Cover],
    alt: 'Avicore motion showcase exploring tactile craft and modern visual energy',
    description: 'High-octane visual identity piece exploring precision performance, kinetic momentum, and modern digital craft.',
    meta: {
      camera: 'RED Komodo 6K',
      lens: 'Canon Cine-Servo 17-120mm',
      aperture: 'T2.8',
      shutter: '1/50s',
      iso: '800',
      year: '2024',
      location: 'Innovation Hub'
    }
  },
  // 4. Avicore 2
  {
    id: '4',
    slug: 'avicore-2',
    name: 'Avicore 2',
    client: 'Avicore Dynamics',
    type: 'motion',
    tag: 'campaign',
    count: 12,
    duration: 32,
    image: avicore2Cover,
    video: avicore2Video,
    gallery: [avicore2Cover],
    alt: 'Avicore 2 creative direction and cinematic brand campaign',
    description: 'An immersive cinematic brand narrative showcasing modern tailoring, evocative lighting, and focused pacing.',
    meta: {
      camera: 'Sony FX6',
      lens: 'Sony GM 24-70mm f/2.8',
      aperture: 'f/2.8',
      shutter: '1/48s',
      iso: '1250',
      year: '2024',
      location: 'Metropolitan Soundstage'
    }
  },
  // 5. Avicore 3
  {
    id: '5',
    slug: 'avicore-3',
    name: 'Avicore 3',
    client: 'Avicore Dynamics',
    type: 'motion',
    tag: 'editorial',
    count: 8,
    duration: 10,
    image: avicore3Cover,
    video: avicore3Video,
    gallery: [avicore3Cover],
    alt: 'Avicore 3 dynamic editorial short exploring form and rhythm',
    description: 'Fluid choreography meets high-contrast cinematography in a focused exploration of human silhouette and form.',
    meta: {
      camera: 'Leica SL2-S',
      lens: 'APO-Summicron-SL 50mm',
      aperture: 'f/2.0',
      shutter: '1/50s',
      iso: '640',
      year: '2024',
      location: 'Concrete Warehouse'
    }
  },
  // 6. Avicore 4
  {
    id: '6',
    slug: 'avicore-4',
    name: 'Avicore 4',
    client: 'Avicore Dynamics',
    type: 'motion',
    tag: 'campaign',
    count: 10,
    duration: 10,
    image: avicore4Cover,
    video: avicore4Video,
    gallery: [avicore4Cover],
    alt: 'Avicore 4 concluding high-impact cinematic visual vignette',
    description: 'Expressive framing, bold saturation, and contemporary visual syntax highlighting avant-garde urban motion.',
    meta: {
      camera: 'ARRI Amira',
      lens: 'Zeiss Super Speed 25mm T1.3',
      aperture: 'T1.8',
      shutter: '1/48s',
      iso: '800',
      year: '2024',
      location: 'Downtown Rooftop'
    }
  },
  // 7. Cafe
  {
    id: '7',
    slug: 'cafe',
    name: 'Cafe',
    client: 'Hospitality & Dining',
    type: 'motion',
    tag: 'commercial',
    count: 11,
    duration: 7,
    image: cafeCover,
    video: cafeVideo,
    isReel: true,
    gallery: [cafeCover],
    alt: 'Culinary motion sizzle reel and cafe ambience tour',
    description: 'Dynamic pacing, culinary artistry, and vibrant restaurant hospitality captured on film.',
    meta: {
      camera: 'Phantom Flex4K',
      lens: 'Laowa 24mm T14 2X PeriProbe',
      aperture: 'T14',
      shutter: '1/2000s (1000fps)',
      iso: '1600',
      year: '2024',
      location: 'Culinary District'
    }
  },
  // 8. Fiddlecraft
  {
    id: '8',
    slug: 'fiddlecraft',
    name: 'Fiddlecraft',
    client: 'Fiddlecraft',
    type: 'motion',
    tag: 'events',
    count: 16,
    duration: 24,
    image: fiddlecraftCover,
    video: fiddlecraftVideo,
    gallery: [fiddlecraftCover],
    alt: 'Fiddlecraft musical and cultural motion production',
    description: 'Electrifying musical performance and rhythmic visuals documenting stage energy and acoustic craft.',
    meta: {
      camera: 'Sony FX9',
      lens: 'Fujinon MK 18-55mm T2.9',
      aperture: 'T2.9',
      shutter: '1/50s',
      iso: '1000',
      year: '2024',
      location: 'Concert Hall'
    }
  },
  // 9. Starfish Showreel
  {
    id: '9',
    slug: 'starfish-showreel',
    name: 'Starfish Showreel',
    client: 'Starfish',
    type: 'motion',
    tag: 'campaign',
    count: 20,
    duration: 30,
    image: starfishCover,
    video: starfishVideo,
    isReel: true,
    gallery: [starfishCover],
    alt: 'Starfish Showreel dynamic motion showcase',
    description: 'A bold showcase of high-impact visual storytelling, creative direction, and seamless cinematography.',
    meta: {
      camera: 'ARRI Alexa 35',
      lens: 'Cooke Panchro/i Classic 32mm',
      aperture: 'T2.3',
      shutter: '1/48s',
      iso: '800',
      year: '2024',
      location: 'Studio Stage'
    }
  },
  // 10. Titan
  {
    id: '10',
    slug: 'titan',
    name: 'Titan',
    client: 'Titan',
    type: 'motion',
    tag: 'commercial',
    count: 14,
    duration: 25,
    image: titanCover,
    video: titanVideo,
    gallery: [titanCover],
    alt: 'Titan premium commercial timepiece and lifestyle campaign',
    description: 'Precision craftsmanship, elegant reflections, and timeless cinematic aesthetics for Titan.',
    meta: {
      camera: 'ARRI Alexa Mini LF',
      lens: 'Master Anamorphic 50mm',
      aperture: 'T1.9',
      shutter: '1/48s',
      iso: '800',
      year: '2024',
      location: 'Production Studio'
    }
  }
];

export const STILL_PROJECTS: Project[] = [
  {
    id: 'still-1',
    slug: 'monochrome-silhouette',
    name: 'Monochrome Silhouette',
    client: 'Editorial Edition',
    type: 'stills',
    tag: 'editorial',
    count: 14,
    image: stillHome,
    gallery: [stillHome],
    alt: 'High-contrast monochrome silhouette photography',
    description: 'Chiaroscuro study examining the delicate boundaries between light, architectural silhouette, and human stillness.',
    meta: {
      camera: 'Leica M11 Monochrom',
      lens: 'Summilux-M 35mm f/1.4 ASPH',
      aperture: 'f/1.4',
      shutter: '1/250s',
      iso: '160',
      year: '2024',
      location: 'Brutalist Pavilion'
    }
  },
  {
    id: 'still-2',
    slug: 'ethereal-form',
    name: 'Ethereal Form',
    client: 'Studio Atelier',
    type: 'stills',
    tag: 'campaign',
    count: 10,
    image: still2,
    gallery: [still2],
    alt: 'Studio portrait with subtle chiaroscuro light and tonal gradations',
    description: 'Minimalist studio exploration celebrating sculptural posture, tactile fabric folds, and tonal intimacy.',
    meta: {
      camera: 'Hasselblad H6D-100c',
      lens: 'HC 2,2/100mm',
      aperture: 'f/2.8',
      shutter: '1/160s',
      iso: '100',
      year: '2024',
      location: 'Natural Light Soundstage'
    }
  },
  {
    id: 'still-3',
    slug: 'atmospheric-horizon',
    name: 'Atmospheric Horizon',
    client: 'Elemental Series',
    type: 'stills',
    tag: 'personal',
    count: 15,
    image: still3,
    gallery: [still3],
    alt: 'Misty landscape bathed in soft ambient twilight',
    description: 'Quiet meditative frames exploring distant horizons, fog layers, and the shifting spectrum of dusk.',
    meta: {
      camera: 'Leica SL2',
      lens: 'Vario-Elmarit-SL 24-90mm f/2.8-4',
      aperture: 'f/4.0',
      shutter: '1/125s',
      iso: '400',
      year: '2024',
      location: 'Highland Ridge'
    }
  },
  {
    id: 'still-4',
    slug: 'kinetic-cadence',
    name: 'Kinetic Cadence',
    client: 'Movement Lab',
    type: 'stills',
    tag: 'campaign',
    count: 16,
    image: still4,
    gallery: [still4],
    alt: 'Dynamic capture of motion blur and athletic grace',
    description: 'High-speed capture freezing human agility into an expressive composition of velocity and rhythm.',
    meta: {
      camera: 'Sony Alpha 1',
      lens: 'FE 50mm f/1.2 GM',
      aperture: 'f/1.8',
      shutter: '1/2000s',
      iso: '500',
      year: '2024',
      location: 'Athletic Arena'
    }
  },
  {
    id: 'still-5',
    slug: 'tonal-balance',
    name: 'Tonal Balance',
    client: 'Objects & Form',
    type: 'stills',
    tag: 'editorial',
    count: 9,
    image: still5,
    gallery: [still5],
    alt: 'Carefully composed still life with soft directional lighting',
    description: 'Contemplative still life compositions balancing negative space, muted ceramics, and delicate shadows.',
    meta: {
      camera: 'Canon EOS R5',
      lens: 'RF 85mm f/1.2L USM DS',
      aperture: 'f/2.0',
      shutter: '1/200s',
      iso: '200',
      year: '2024',
      location: 'Ceramic Studio'
    }
  },
  {
    id: 'still-6',
    slug: 'candid-essence',
    name: 'Candid Essence',
    client: 'Humanity Chronicles',
    type: 'stills',
    tag: 'editorial',
    count: 11,
    image: still25,
    gallery: [still25],
    alt: 'Intimate candid portrait highlighting genuine expressions and natural grain',
    description: 'Unposed portraiture documenting authentic human moments with analog warmth and raw depth.',
    meta: {
      camera: 'Leica Q2 Monochrom',
      lens: 'Summilux 28mm f/1.7 ASPH',
      aperture: 'f/1.7',
      shutter: '1/400s',
      iso: '320',
      year: '2024',
      location: 'Old Town Alleyways'
    }
  },
  {
    id: 'still-7',
    slug: 'golden-hour-textures',
    name: 'Golden Hour Textures',
    client: 'Solstice Series',
    type: 'stills',
    tag: 'personal',
    count: 14,
    image: still28,
    gallery: [still28],
    alt: 'Warm low-angle sun rays skimming across textured surfaces',
    description: 'Luminous light studies chasing late-afternoon amber beams across organic materials and rough surfaces.',
    meta: {
      camera: 'Nikon Z9',
      lens: 'NIKKOR Z 58mm f/0.95 S Noct',
      aperture: 'f/1.2',
      shutter: '1/1600s',
      iso: '64',
      year: '2024',
      location: 'Coastal Escarpment'
    }
  },
  {
    id: 'still-8',
    slug: 'sculpted-light',
    name: 'Sculpted Light',
    client: 'Lumina Collective',
    type: 'stills',
    tag: 'campaign',
    count: 13,
    image: still29,
    gallery: [still29],
    alt: 'Prismatic light refraction cast across deep black backdrop',
    description: 'Optical experiments utilizing custom glass prisms to slice incandescent beams into sculptural ribbons.',
    meta: {
      camera: 'Hasselblad 907X 50C',
      lens: 'XCD 45mm f/4 P',
      aperture: 'f/4.0',
      shutter: '1/60s',
      iso: '100',
      year: '2024',
      location: 'Darkroom Stage'
    }
  },
  {
    id: 'still-9',
    slug: 'metropolitan-shadows',
    name: 'Metropolitan Shadows',
    client: 'Urban Fabric',
    type: 'stills',
    tag: 'editorial',
    count: 12,
    image: still30,
    gallery: [still30],
    alt: 'Deep street-level contrast between glowing pavement and towering silhouettes',
    description: 'Graphic street photography framed by colossal concrete pillars and dramatic morning backlighting.',
    meta: {
      camera: 'Fujifilm X-Pro3',
      lens: 'XF 23mm f/1.4 R LM WR',
      aperture: 'f/2.8',
      shutter: '1/800s',
      iso: '320',
      year: '2024',
      location: 'Central Transit Hub'
    }
  },
  {
    id: 'still-10',
    slug: 'quiet-cadence',
    name: 'Quiet Cadence',
    client: 'Minimalism Index',
    type: 'stills',
    tag: 'personal',
    count: 7,
    image: still31,
    gallery: [still31],
    alt: 'Minimalist composition with subtle textures and gentle negative space',
    description: 'Poetic stillness captured through isolated subject placement and expansive negative breathing room.',
    meta: {
      camera: 'Leica M10-R',
      lens: 'APO-Summicron-M 50mm f/2 ASPH',
      aperture: 'f/2.8',
      shutter: '1/500s',
      iso: '100',
      year: '2024',
      location: 'Salt Flat Expanse'
    }
  },
  {
    id: 'still-11',
    slug: 'raw-contrast',
    name: 'Raw Contrast',
    client: 'Subculture Archive',
    type: 'stills',
    tag: 'commercial',
    count: 10,
    image: still32,
    gallery: [still32],
    alt: 'Industrial surfaces, gritty metals and intense chiaroscuro contrast',
    description: 'Tactile exploration of weathered industrial steel, oxidized textures, and aggressive specular highlights.',
    meta: {
      camera: 'Sony A7R V',
      lens: 'FE 35mm f/1.4 GM',
      aperture: 'f/2.0',
      shutter: '1/320s',
      iso: '400',
      year: '2024',
      location: 'Decommissioned Dockyard'
    }
  },
  {
    id: 'still-12',
    slug: 'nocturne-echo',
    name: 'Nocturne Echo',
    client: 'Night Anthology',
    type: 'stills',
    tag: 'personal',
    count: 9,
    image: still33,
    gallery: [still33],
    alt: 'Moody night photography illuminated by solitary neon luminescence',
    description: 'Cinematic nocturne frames capturing foggy streets, wet asphalt reflections, and distant sodium halos.',
    meta: {
      camera: 'Leica SL2-S',
      lens: 'Summicron-SL 35mm f/2 ASPH',
      aperture: 'f/2.0',
      shutter: '1/40s',
      iso: '1600',
      year: '2024',
      location: 'Harbor District'
    }
  },
  {
    id: 'still-13',
    slug: 'velvet-grayscale',
    name: 'Velvet Grayscale',
    client: 'Haute Monochroma',
    type: 'stills',
    tag: 'editorial',
    count: 12,
    image: still34,
    gallery: [still34],
    alt: 'Rich velvety tones and nuanced shadow details in medium format black and white',
    description: 'High-fashion editorial exploring tactile textile weaves, structural draping, and velvety dark midtones.',
    meta: {
      camera: 'Hasselblad H6D',
      lens: 'HC 80mm f/2.8',
      aperture: 'f/4.0',
      shutter: '1/200s',
      iso: '100',
      year: '2024',
      location: 'Couture Studio'
    }
  },
  {
    id: 'still-14',
    slug: 'stillness-in-motion',
    name: 'Stillness in Motion',
    client: 'Odd Mango Archive',
    type: 'stills',
    tag: 'campaign',
    count: 15,
    image: still35,
    gallery: [still35],
    alt: 'Flagship fine-art still celebrating stillness and pure optical depth',
    description: 'The defining still signature piece representing the Odd Mango photographic philosophy: documenting emotion, movement, and meaning.',
    meta: {
      camera: 'Leica M11',
      lens: 'Noctilux-M 50mm f/0.95 ASPH',
      aperture: 'f/0.95',
      shutter: '1/1000s',
      iso: '64',
      year: '2024',
      location: 'Archive Vault'
    }
  },
  {
    id: 'still-15',
    slug: 'urban-solitude',
    name: 'Urban Solitude',
    client: 'Spatial Archive',
    type: 'stills',
    tag: 'personal',
    count: 12,
    image: still36,
    gallery: [still36],
    alt: 'Moody metropolitan architecture and dramatic diagonal shadows',
    description: 'Atmospheric urban documentation capturing geometry, glass reflections, and solitary human presence.',
    meta: {
      camera: 'Phase One XF IQ4 150MP',
      lens: 'Schneider Kreuznach 80mm LS f/2.8',
      aperture: 'f/4.0',
      shutter: '1/320s',
      iso: '200',
      year: '2024',
      location: 'Metropolitan Financial Center'
    }
  },
  {
    id: 'still-16',
    slug: 'modernist-geometry',
    name: 'Modernist Geometry',
    client: 'Design Quarterly',
    type: 'stills',
    tag: 'editorial',
    count: 8,
    image: still37,
    gallery: [still37],
    alt: 'Abstract concrete forms, sharp angles and sun-drenched surfaces',
    description: 'A study in modernist architecture exploring clean lines, raking sunlight, and textured concrete surfaces.',
    meta: {
      camera: 'Fujifilm GFX 100 II',
      lens: 'GF 45mm f/2.8 R WR',
      aperture: 'f/5.6',
      shutter: '1/500s',
      iso: '160',
      year: '2024',
      location: 'Modernist Museum Wing'
    }
  }
];

export const ALL_PROJECTS: Project[] = [...PROJECTS, ...STILL_PROJECTS];
