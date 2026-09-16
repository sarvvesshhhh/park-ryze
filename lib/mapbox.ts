export const DEFAULT_MAP_KEY =
  process.env.NEXT_PUBLIC_MAP_KEY ||
  process.env.NEXT_PUBLIC_MAPTILER_KEY ||
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
  'G6nQ7QJ4pu2tz9txZigU';

export type LandmarkCategory =
  | 'university'
  | 'hospital'
  | 'mall'
  | 'station'
  | 'commercial'
  | 'landmark'
  | 'street'
  | 'locality';

export interface GeocodingResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
  category: LandmarkCategory;
  subtitle?: string;
  context?: Array<{ id: string; text: string }>;
}

/**
 * Curated High-Precision Mumbai Landmark & Building Registry
 * Guaranteed instant, zero-latency resolution for top colleges, hospitals, malls, tech hubs, and stations.
 */
export const MUMBAI_CURATED_LANDMARKS: Array<{
  name: string;
  aliases: string[];
  subtitle: string;
  coords: [number, number]; // [lng, lat]
  category: LandmarkCategory;
}> = [
  // Universities & Colleges
  {
    name: 'NMIMS University (Narsee Monjee)',
    aliases: ['nmims', 'narsee monjee', 'svkm nmims', 'nmims vile parle', 'mims'],
    subtitle: 'V. L. Mehta Road, Vile Parle West, Mumbai',
    coords: [72.8365, 19.1034],
    category: 'university',
  },
  {
    name: 'Mithibai College of Arts & Chauhan Institute',
    aliases: ['mithibai', 'mithibai college', 'svkm mithibai'],
    subtitle: 'Gulmohar Road, Vile Parle West, Mumbai',
    coords: [72.8398, 19.1026],
    category: 'university',
  },
  {
    name: 'D. J. Sanghvi College of Engineering (DJSCE)',
    aliases: ['djsce', 'dj sanghvi', 'dwarkadas sanghvi'],
    subtitle: 'Plot No. U-15, J.V.P.D. Scheme, Vile Parle West',
    coords: [72.8378, 19.1077],
    category: 'university',
  },
  {
    name: 'IIT Bombay (Indian Institute of Technology)',
    aliases: ['iit bombay', 'iit powai', 'iitb'],
    subtitle: 'Main Gate Road, Powai, Mumbai',
    coords: [72.9133, 19.1334],
    category: 'university',
  },
  {
    name: "St. Xavier's College",
    aliases: ["st xaviers", 'xaviers college', 'st xavier'],
    subtitle: '5, Mahapalika Marg, Dhobi Talao, Fort, Mumbai',
    coords: [72.8315, 18.9431],
    category: 'university',
  },
  {
    name: 'Jai Hind College',
    aliases: ['jai hind', 'jai hind college churchgate'],
    subtitle: "'A' Road, Churchgate, Mumbai",
    coords: [72.8256, 18.9328],
    category: 'university',
  },

  // Corporate Parks & Commercial Towers
  {
    name: 'Jio World Convention Centre & BKC Hub',
    aliases: ['bkc', 'jio world convention', 'bandra kurla complex', 'jio world'],
    subtitle: 'G Block, Bandra Kurla Complex, Bandra East, Mumbai',
    coords: [72.8681, 19.0645],
    category: 'commercial',
  },
  {
    name: 'Nesco IT Park & Bombay Exhibition Centre',
    aliases: ['nesco', 'nesco it park', 'bombay exhibition centre', 'bec goregaon'],
    subtitle: 'Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8584, 19.1528],
    category: 'commercial',
  },
  {
    name: 'Mindspace Business Park',
    aliases: ['mindspace', 'mindspace malad', 'malad it park'],
    subtitle: 'Link Road, Malad West, Mumbai',
    coords: [72.8354, 19.1762],
    category: 'commercial',
  },
  {
    name: 'World Trade Centre (WTC)',
    aliases: ['wtc', 'world trade centre', 'wtc cuffe parade'],
    subtitle: 'Cuffe Parade, Colaba, Mumbai',
    coords: [72.8174, 18.9137],
    category: 'commercial',
  },
  {
    name: 'One World Center (Indiabulls Finance Centre)',
    aliases: ['indiabulls', 'one world center', 'indiabulls finance centre', 'lower parel office'],
    subtitle: 'Senapati Bapat Marg, Lower Parel, Mumbai',
    coords: [72.8291, 19.0068],
    category: 'commercial',
  },
  {
    name: 'Hiranandani Business Park (Galleria)',
    aliases: ['hiranandani powai', 'galleria powai', 'hiranandani business park'],
    subtitle: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai',
    coords: [72.9051, 19.1197],
    category: 'commercial',
  },

  // Shopping Malls & Commercial Hubs
  {
    name: 'Phoenix Palladium (High Street Phoenix)',
    aliases: ['phoenix mall', 'palladium', 'high street phoenix', 'phoenix lower parel'],
    subtitle: '462, Senapati Bapat Marg, Lower Parel, Mumbai',
    coords: [72.8242, 18.9958],
    category: 'mall',
  },
  {
    name: 'Jio World Drive Mall',
    aliases: ['jio world drive', 'jio mall bkc', 'jio drive'],
    subtitle: 'Maker Maxity, Bandra Kurla Complex, Mumbai',
    coords: [72.8596, 19.0631],
    category: 'mall',
  },
  {
    name: 'Inorbit Mall Malad',
    aliases: ['inorbit', 'inorbit mall', 'inorbit malad'],
    subtitle: 'New Link Road, Malad West, Mumbai',
    coords: [72.8347, 19.1739],
    category: 'mall',
  },
  {
    name: 'Oberoi Mall Goregaon',
    aliases: ['oberoi mall', 'oberoi goregaon', 'oberoi'],
    subtitle: 'Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8617, 19.1738],
    category: 'mall',
  },
  {
    name: 'Infiniti Mall Andheri',
    aliases: ['infiniti andheri', 'infiniti mall andheri', 'infiniti link road'],
    subtitle: 'Link Road, Oshiwara, Andheri West, Mumbai',
    coords: [72.8312, 19.1415],
    category: 'mall',
  },
  {
    name: 'Phoenix Marketcity Kurla',
    aliases: ['phoenix kurla', 'marketcity kurla', 'phoenix market city'],
    subtitle: 'Lal Bahadur Shastri Marg, Kurla West, Mumbai',
    coords: [72.8887, 19.0864],
    category: 'mall',
  },

  // Hospitals & Healthcare
  {
    name: 'Lilavati Hospital & Research Centre',
    aliases: ['lilavati', 'lilavati hospital', 'leelavati'],
    subtitle: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    coords: [72.8297, 19.0514],
    category: 'hospital',
  },
  {
    name: 'Kokilaben Dhirubhai Ambani Hospital',
    aliases: ['kokilaben', 'kokilaben hospital', 'ambani hospital andheri'],
    subtitle: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West',
    coords: [72.8271, 19.1311],
    category: 'hospital',
  },
  {
    name: 'Bombay Hospital & Medical Research Centre',
    aliases: ['bombay hospital', 'bombay hospital marine lines'],
    subtitle: '12, Marine Lines, New Marine Lines, Mumbai',
    coords: [72.8286, 18.9404],
    category: 'hospital',
  },
  {
    name: 'Nanavati Max Super Speciality Hospital',
    aliases: ['nanavati', 'nanavati hospital', 'nanavati max'],
    subtitle: 'Swami Vivekananda Road, Vile Parle West, Mumbai',
    coords: [72.8436, 19.0961],
    category: 'hospital',
  },
  {
    name: 'P. D. Hinduja National Hospital',
    aliases: ['hinduja', 'hinduja hospital', 'pd hinduja'],
    subtitle: 'Veer Savarkar Marg, Mahim West, Mumbai',
    coords: [72.8402, 19.0331],
    category: 'hospital',
  },

  // Transit & Airports
  {
    name: 'Chhatrapati Shivaji Maharaj Airport (Terminal 2 - Int.)',
    aliases: ['airport t2', 't2 airport', 'international airport', 'mumbai airport t2'],
    subtitle: 'Sahar Road, Andheri East, Mumbai',
    coords: [72.8744, 19.0974],
    category: 'station',
  },
  {
    name: 'Chhatrapati Shivaji Maharaj Airport (Terminal 1 - Domestic)',
    aliases: ['airport t1', 't1 airport', 'domestic airport', 'santacruz airport'],
    subtitle: 'Western Express Highway, Vile Parle East, Mumbai',
    coords: [72.8519, 19.0886],
    category: 'station',
  },
  {
    name: 'CSMT (Chhatrapati Shivaji Maharaj Terminus)',
    aliases: ['csmt', 'vt station', 'victoria terminus', 'cst station'],
    subtitle: 'Fort, Mumbai Central, Mumbai',
    coords: [72.8358, 18.9401],
    category: 'station',
  },
  {
    name: 'Bandra Terminus Railway Station',
    aliases: ['bandra terminus', 'bandra station', 'bandra east station'],
    subtitle: 'Naupada, Bandra East, Mumbai',
    coords: [72.8427, 19.0628],
    category: 'station',
  },
  {
    name: 'Andheri Railway & Metro Station',
    aliases: ['andheri station', 'andheri metro', 'andheri west station'],
    subtitle: 'S. V. Road, Andheri West, Mumbai',
    coords: [72.8466, 19.1197],
    category: 'station',
  },

  // Iconic Landmarks & Waterfronts
  {
    name: 'Gateway of India',
    aliases: ['gateway of india', 'gateway', 'colaba gateway'],
    subtitle: 'Apollo Bandar, Colaba, Mumbai',
    coords: [72.8347, 18.922],
    category: 'landmark',
  },
  {
    name: "Marine Drive (Queen's Necklace)",
    aliases: ['marine drive', 'queens necklace', 'nariman point promenade'],
    subtitle: 'Netaji Subhash Chandra Bose Road, Mumbai',
    coords: [72.8234, 18.9438],
    category: 'landmark',
  },
  {
    name: 'Bandra-Worli Sea Link Promenade',
    aliases: ['sea link', 'bandra worli sea link', 'bandra sea link toll'],
    subtitle: 'Bandra Reclamation, Bandra West, Mumbai',
    coords: [72.8197, 19.0345],
    category: 'landmark',
  },
  {
    name: 'Nita Mukesh Ambani Cultural Centre (NMACC)',
    aliases: ['nmacc', 'nita mukesh ambani cultural centre', 'ambani cultural centre'],
    subtitle: 'Jio World Centre, G Block, BKC, Mumbai',
    coords: [72.8689, 19.0652],
    category: 'landmark',
  },
  {
    name: 'Taj Mahal Palace Hotel',
    aliases: ['taj mahal palace', 'taj hotel', 'taj colaba'],
    subtitle: 'Apollo Bandar, Colaba, Mumbai',
    coords: [72.8333, 18.9217],
    category: 'commercial',
  },
];

/**
 * Real Multi-Tier Hybrid Search
 * 1. Curated Mumbai Landmarks & Buildings (Instant matches for NMIMS, Mithibai, BKC, Lilavati, Phoenix Mall, etc.)
 * 2. Photon (OpenStreetMap POI & Building Geocoder) biased to Mumbai
 * 3. MapTiler / Mapbox Geocoding (Streets & Localities)
 */
export async function searchHybridPlaces(
  query: string,
  token: string = DEFAULT_MAP_KEY,
  proximity: [number, number] = [72.8372, 19.1031] // Mumbai [lng, lat]
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];

  const rawQuery = query.trim();
  const q = rawQuery.toLowerCase();
  const [lng, lat] = proximity;
  const results: GeocodingResult[] = [];
  const seenNames = new Set<string>();

  // 1. Check Curated Mumbai Landmarks & Buildings First
  for (const lm of MUMBAI_CURATED_LANDMARKS) {
    const matches =
      lm.name.toLowerCase().includes(q) ||
      lm.aliases.some((alias) => alias.includes(q) || q.includes(alias));

    if (matches) {
      results.push({
        id: `curated-${lm.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        place_name: `${lm.name}, ${lm.subtitle}`,
        text: lm.name,
        center: lm.coords,
        category: lm.category,
        subtitle: lm.subtitle,
      });
      seenNames.add(lm.name.toLowerCase());
    }
  }

  // 2. Query Photon (OpenStreetMap POI & Building API - No key required, super fast POI resolution)
  try {
    const encoded = encodeURIComponent(`${rawQuery} Mumbai`);
    const photonUrl = `https://photon.komoot.io/api/?q=${encoded}&lat=${lat}&lon=${lng}&limit=6`;
    const res = await fetch(photonUrl);

    if (res.ok) {
      const data = await res.json();
      if (data.features) {
        for (const feat of data.features) {
          const props = feat.properties || {};
          const name = props.name || props.street || '';
          if (!name || seenNames.has(name.toLowerCase())) continue;

          // Deduce category
          let category: LandmarkCategory = 'landmark';
          const osmVal = (props.osm_value || '').toLowerCase();
          const osmKey = (props.osm_key || '').toLowerCase();

          if (['university', 'college', 'school'].includes(osmVal) || osmKey === 'education') {
            category = 'university';
          } else if (['hospital', 'clinic', 'pharmacy', 'doctors'].includes(osmVal)) {
            category = 'hospital';
          } else if (['mall', 'supermarket', 'commercial', 'marketplace'].includes(osmVal)) {
            category = 'mall';
          } else if (['station', 'subway', 'bus_stop', 'aerodrome', 'railway'].includes(osmVal)) {
            category = 'station';
          } else if (['office', 'building', 'commercial'].includes(osmKey) || ['hotel', 'apartments'].includes(osmVal)) {
            category = 'commercial';
          } else if (['highway', 'primary', 'secondary', 'residential'].includes(osmVal)) {
            category = 'street';
          }

          const parts = [props.street, props.district || props.suburb, props.city || 'Mumbai'].filter(Boolean);
          const subtitle = parts.join(', ') || 'Mumbai, Maharashtra';

          results.push({
            id: `photon-${feat.properties.osm_id || Math.random()}`,
            place_name: `${name}, ${subtitle}`,
            text: name,
            center: feat.geometry.coordinates as [number, number],
            category,
            subtitle,
          });
          seenNames.add(name.toLowerCase());
        }
      }
    }
  } catch (err) {
    console.warn('Photon geocoding request warning:', err);
  }

  // 3. Query MapTiler or Mapbox Geocoding as Fallback
  const key = token?.trim() || DEFAULT_MAP_KEY;
  if (key && results.length < 5) {
    const encoded = encodeURIComponent(rawQuery);

    if (!key.startsWith('pk.')) {
      // MapTiler Geocoding
      try {
        const url = `https://api.maptiler.com/geocoding/${encoded}.json?key=${key}&proximity=${lng},${lat}&country=in&limit=4`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          (data.features || []).forEach((f: any) => {
            const title = f.text || f.place_name.split(',')[0];
            if (!seenNames.has(title.toLowerCase())) {
              results.push({
                id: f.id,
                place_name: f.place_name,
                text: title,
                center: f.center,
                category: f.place_type?.includes('address') ? 'street' : 'locality',
                subtitle: f.place_name,
              });
              seenNames.add(title.toLowerCase());
            }
          });
        }
      } catch (err) {
        console.warn('MapTiler geocoding error:', err);
      }
    } else {
      // Mapbox Geocoding
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${key}&proximity=${lng},${lat}&country=IN&limit=4`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          (data.features || []).forEach((f: any) => {
            if (!seenNames.has(f.text.toLowerCase())) {
              results.push({
                id: f.id,
                place_name: f.place_name,
                text: f.text,
                center: f.center,
                category: 'locality',
                subtitle: f.place_name,
              });
              seenNames.add(f.text.toLowerCase());
            }
          });
        }
      } catch (err) {
        console.warn('Mapbox geocoding error:', err);
      }
    }
  }

  return results.slice(0, 8);
}

// Backward compatibility alias
export const searchMapboxPlaces = searchHybridPlaces;

/**
 * Real Driving Directions API
 * Uses Mapbox if pk. token or OpenStreetMap OSRM driving engine
 */
export async function fetchMapboxDirections(
  startLngLat: [number, number],
  endLngLat: [number, number],
  token?: string
) {
  const [sLng, sLat] = startLngLat;
  const [eLng, eLat] = endLngLat;

  if (token && token.trim().startsWith('pk.')) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${sLng},${sLat};${eLng},${eLat}?geometries=geojson&steps=true&overview=full&access_token=${token.trim()}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        return data.routes[0];
      }
    }
  }

  // OSRM Driving Engine (Free, highly accurate street network)
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(osrmUrl);
  if (!res.ok) throw new Error('OSRM routing request failed');
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) throw new Error('No route found');
  return data.routes[0];
}
