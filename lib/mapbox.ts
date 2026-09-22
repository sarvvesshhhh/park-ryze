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

  // Residential Cooperative Housing Societies (Vile Parle West / JVPD Scheme Cluster)
  {
    name: 'Gulmohar Heights CHS',
    aliases: ['gulmohar heights', 'gulmohar heights chs', 'gulmohar cross road 9', 'gulmohar 9'],
    subtitle: 'Gulmohar Cross Road 9, Near NMIMS, Vile Parle West, Mumbai',
    coords: [72.8372, 19.1031],
    category: 'landmark',
  },
  {
    name: 'Silver Oak CHS',
    aliases: ['silver oak', 'silver oak chs', 'silver oak vile parle', 'gulmohar 7'],
    subtitle: 'Gulmohar Cross Road 7, JVPD Scheme, Vile Parle West, Mumbai',
    coords: [72.8358, 19.1046],
    category: 'landmark',
  },
  {
    name: 'Ashoka Enclave CHS',
    aliases: ['ashoka enclave', 'ashoka enclave chs', 'ashoka nmims'],
    subtitle: 'V. L. Mehta Road, Opp NMIMS New Campus, Vile Parle West, Mumbai',
    coords: [72.8351, 19.1039],
    category: 'landmark',
  },
  {
    name: 'Vasant Vihar CHS',
    aliases: ['vasant vihar', 'vasant vihar chs', 'vasant vihar mithibai'],
    subtitle: '10th Road, JVPD Scheme, Near Mithibai College, Vile Parle West, Mumbai',
    coords: [72.8394, 19.1022],
    category: 'landmark',
  },
  {
    name: 'Sagar Villa CHS',
    aliases: ['sagar villa', 'sagar villa chs', 'gulmohar 10'],
    subtitle: 'Gulmohar Cross Road 10, JVPD Scheme, Vile Parle West, Mumbai',
    coords: [72.8392, 19.1051],
    category: 'landmark',
  },
  {
    name: 'Prarthana Heights CHS',
    aliases: ['prarthana heights', 'prarthana heights chs', 'prarthana juhu'],
    subtitle: 'Gulmohar Cross Road 5, Near Juhu Circle, Vile Parle West, Mumbai',
    coords: [72.8348, 19.1015],
    category: 'landmark',
  },
  {
    name: 'Madhukunj CHS',
    aliases: ['madhukunj', 'madhukunj chs', 'kaifi azmi parking', 'gulmohar 4'],
    subtitle: 'Gulmohar Cross Road 4, Near Kaifi Azmi Park, JVPD Scheme, Mumbai',
    coords: [72.8341, 19.1054],
    category: 'landmark',
  },
  {
    name: 'Palm Springs CHS',
    aliases: ['palm springs', 'palm springs chs', 'gulmohar 12'],
    subtitle: 'Gulmohar Cross Road 12, JVPD Scheme, Vile Parle West, Mumbai',
    coords: [72.8383, 19.1068],
    category: 'landmark',
  },
  {
    name: 'Shanti Kunj CHS',
    aliases: ['shanti kunj', 'shanti kunj chs', 'shanti kunj cooper'],
    subtitle: 'N.S. Road No. 3, Near Cooper Hospital, JVPD Scheme, Mumbai',
    coords: [72.8345, 19.1062],
    category: 'landmark',
  },

  // ── NMIMS MPSTME & College Vicinity ───────────────────────────────────────
  {
    name: 'Mukesh Patel School of Technology (NMIMS MPSTME)',
    aliases: ['mpstme', 'mukesh patel', 'nmims mpstme', 'mpstme vile parle', 'svkm mpstme', 'mukesh patel school of technology'],
    subtitle: 'Bhaktivedanta Swami Marg, JVPD Scheme, Vile Parle West, Mumbai',
    coords: [72.8368, 19.1085],
    category: 'university',
  },
  {
    name: 'MPSTME Tech Enclave Parking',
    aliases: ['mpstme parking', 'mpstme tech enclave', 'bhaktivedanta swami marg parking'],
    subtitle: 'Bhaktivedanta Swami Marg, Opp NMIMS MPSTME, Vile Parle West, Mumbai',
    coords: [72.8370, 19.1082],
    category: 'commercial',
  },
  {
    name: 'JVPD Prime Commercial Plaza',
    aliases: ['jvpd plaza', 'jvpd commercial', 'vl mehta road parking', 'jvpd prime'],
    subtitle: 'V.L. Mehta Road, JVPD Scheme, Near NMIMS MPSTME, Vile Parle West, Mumbai',
    coords: [72.8355, 19.1075],
    category: 'commercial',
  },

  // ── Western Railway Line ───────────────────────────────────────────────────
  {
    name: 'Churchgate Railway Station (Western Railway Terminal)',
    aliases: ['churchgate', 'churchgate station', 'churchgate terminus', 'western railway churchgate'],
    subtitle: 'Marine Lines, Churchgate, South Mumbai',
    coords: [72.8261, 18.9359],
    category: 'station',
  },
  {
    name: 'Mumbai Central Railway Station',
    aliases: ['mumbai central', 'bombay central', 'mumbai central station', 'grant road station'],
    subtitle: 'Mumbai Central, Mumbai',
    coords: [72.8259, 18.9692],
    category: 'station',
  },
  {
    name: 'Dadar Railway Station (Western Line)',
    aliases: ['dadar', 'dadar station', 'dadar west station', 'dadar railway'],
    subtitle: 'Dadar West, Mumbai',
    coords: [72.8410, 19.0183],
    category: 'station',
  },
  {
    name: 'Bandra Railway Station (Western Line)',
    aliases: ['bandra station', 'bandra local', 'bandra west station', 'bandra railway station'],
    subtitle: 'Station Road, Bandra West, Mumbai',
    coords: [72.8391, 19.0596],
    category: 'station',
  },
  {
    name: 'Vile Parle Railway Station',
    aliases: ['vile parle station', 'vile parle west station', 'vile parle railway'],
    subtitle: 'Station Road, Vile Parle West, Mumbai',
    coords: [72.8390, 19.0986],
    category: 'station',
  },
  {
    name: 'Santacruz Railway Station',
    aliases: ['santacruz', 'santacruz station', 'santa cruz station', 'santacruz west station'],
    subtitle: 'Santacruz West, Mumbai',
    coords: [72.8371, 19.0810],
    category: 'station',
  },
  {
    name: 'Khar Road Railway Station',
    aliases: ['khar', 'khar road', 'khar station', 'khar road station'],
    subtitle: 'Khar Road, Bandra, Mumbai',
    coords: [72.8356, 19.0707],
    category: 'station',
  },
  {
    name: 'Jogeshwari Railway Station',
    aliases: ['jogeshwari', 'jogeshwari station', 'jogeshwari west station', 'jogeshwari railway'],
    subtitle: 'S.V. Road, Jogeshwari West, Mumbai',
    coords: [72.8488, 19.1365],
    category: 'station',
  },
  {
    name: 'Goregaon Railway Station',
    aliases: ['goregaon', 'goregaon station', 'goregaon west station'],
    subtitle: 'S.V. Road, Goregaon West, Mumbai',
    coords: [72.8487, 19.1592],
    category: 'station',
  },
  {
    name: 'Malad Railway Station',
    aliases: ['malad', 'malad station', 'malad west station', 'malad railway'],
    subtitle: 'S.V. Road, Malad West, Mumbai',
    coords: [72.8478, 19.1868],
    category: 'station',
  },
  {
    name: 'Kandivali Railway Station',
    aliases: ['kandivali', 'kandivali station', 'kandivali west station'],
    subtitle: 'S.V. Road, Kandivali West, Mumbai',
    coords: [72.8474, 19.2050],
    category: 'station',
  },
  {
    name: 'Borivali Railway Station',
    aliases: ['borivali', 'borivali station', 'borivali west station', 'borivali east station'],
    subtitle: 'Borivali, Mumbai',
    coords: [72.8547, 19.2285],
    category: 'station',
  },
  {
    name: 'Dahisar Railway Station',
    aliases: ['dahisar', 'dahisar station', 'dahisar west station', 'dahisar railway'],
    subtitle: 'S.N. Dubey Road, Dahisar West, Mumbai',
    coords: [72.8580, 19.2545],
    category: 'station',
  },
  {
    name: 'Mira Road Railway Station',
    aliases: ['mira road', 'mira road station', 'mira station', 'mira road railway'],
    subtitle: 'Station Road, Shanti Nagar, Mira Road, Mumbai MMR',
    coords: [72.8560, 19.2815],
    category: 'station',
  },
  {
    name: 'Bhayander Railway Station',
    aliases: ['bhayander', 'bhayander station', 'bhayander west station', 'bhayander railway'],
    subtitle: 'Station Road, Bhayander West, Mumbai MMR',
    coords: [72.8515, 19.3092],
    category: 'station',
  },
  {
    name: 'Lower Parel Railway Station',
    aliases: ['lower parel station', 'lower parel railway', 'prabhadevi station', 'lower parel'],
    subtitle: 'Lower Parel, Mumbai',
    coords: [72.8318, 18.9966],
    category: 'station',
  },

  // ── Mumbai Metro Line 1 (Blue: Versova–Ghatkopar) ─────────────────────────
  {
    name: 'Versova Metro Station (Line 1)',
    aliases: ['versova metro', 'versova metro station', 'line 1 versova', 'blue line versova'],
    subtitle: 'Old Nagardas Road, Versova, Andheri West, Mumbai',
    coords: [72.8173, 19.1320],
    category: 'station',
  },
  {
    name: 'D.N. Nagar Metro Station (Line 1)',
    aliases: ['dn nagar metro', 'd n nagar metro', 'dn nagar station', 'line 1 dn nagar'],
    subtitle: 'D.N. Nagar, Andheri West, Mumbai',
    coords: [72.8230, 19.1275],
    category: 'station',
  },
  {
    name: 'Andheri Metro Station (Line 1)',
    aliases: ['andheri metro station', 'andheri metro line 1', 'line 1 andheri'],
    subtitle: 'Andheri, Mumbai',
    coords: [72.8466, 19.1197],
    category: 'station',
  },
  {
    name: 'Chakala Metro Station (Line 1)',
    aliases: ['chakala metro', 'chakala station', 'chakala metro line 1', 'chakala andheri east'],
    subtitle: 'MIDC, Andheri East, Mumbai',
    coords: [72.8591, 19.1133],
    category: 'station',
  },
  {
    name: 'Ghatkopar Metro Station (Line 1)',
    aliases: ['ghatkopar metro', 'ghatkopar metro station', 'line 1 ghatkopar', 'blue line ghatkopar'],
    subtitle: 'Ghatkopar East, Mumbai',
    coords: [72.9075, 19.0862],
    category: 'station',
  },

  // ── Mumbai Metro Line 3 (Aqua: Colaba–SEEPZ–Airport) ─────────────────────
  {
    name: 'BKC Metro Station (Line 3 – Aqua)',
    aliases: ['bkc metro', 'bkc metro station', 'line 3 bkc', 'aqua line bkc', 'bkc aqua'],
    subtitle: 'G Block, Bandra Kurla Complex, Mumbai',
    coords: [72.8693, 19.0668],
    category: 'station',
  },
  {
    name: 'SEEPZ Metro Station (Line 3 – Aqua)',
    aliases: ['seepz metro', 'seepz station', 'line 3 seepz', 'aqua line seepz', 'marol metro'],
    subtitle: 'SEEPZ, Marol, Andheri East, Mumbai',
    coords: [72.8702, 19.1145],
    category: 'station',
  },
  {
    name: 'CSMIA Airport Metro Station (Line 3 – Aqua)',
    aliases: ['airport metro', 'csmia metro', 'airport line 3', 'aqua line airport', 'mumbai airport metro'],
    subtitle: 'Chhatrapati Shivaji Maharaj International Airport, Andheri East, Mumbai',
    coords: [72.8744, 19.0974],
    category: 'station',
  },
  {
    name: 'Vidyanagari Metro Station (Line 3 – Aqua)',
    aliases: ['vidyanagari metro', 'kalina metro', 'line 3 vidyanagari', 'cst road metro'],
    subtitle: 'Vidyanagari Road, Santacruz East, Mumbai',
    coords: [72.8584, 19.0756],
    category: 'station',
  },

  // ── Mumbai Metro Line 7 (Red: Andheri East–Dahisar East) ──────────────────
  {
    name: 'Gundavali Metro Station (Line 7 – Red)',
    aliases: ['gundavali metro', 'gundavali station', 'line 7 gundavali', 'red line andheri'],
    subtitle: 'Western Express Highway, Andheri East, Mumbai',
    coords: [72.8695, 19.1232],
    category: 'station',
  },
  {
    name: 'Aarey Metro Station (Line 7 – Red)',
    aliases: ['aarey metro', 'aarey station', 'line 7 aarey', 'aarey colony metro', 'red line goregaon east'],
    subtitle: 'Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8670, 19.1595],
    category: 'station',
  },
  {
    name: 'Goregaon Metro Station (Line 7 – Red)',
    aliases: ['goregaon metro', 'goregaon east metro', 'line 7 goregaon', 'red line goregaon'],
    subtitle: 'Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8625, 19.1620],
    category: 'station',
  },
  {
    name: 'Pahadi Eksar Metro Station (Line 7 – Red)',
    aliases: ['pahadi eksar metro', 'borivali east metro', 'line 7 borivali east', 'pahadi metro'],
    subtitle: 'Western Express Highway, Borivali East, Mumbai',
    coords: [72.8601, 19.2108],
    category: 'station',
  },

  // ── Corporate Parks & Commercial Hubs (new) ───────────────────────────────
  {
    name: 'Nesco IT Park & Bombay Exhibition Centre',
    aliases: ['nesco', 'nesco it park', 'bombay exhibition centre', 'bec goregaon', 'nesco goregaon'],
    subtitle: 'Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8584, 19.1528],
    category: 'commercial',
  },
  {
    name: 'Nirlon Knowledge Park',
    aliases: ['nirlon', 'nirlon knowledge park', 'nirlon goregaon', 'nirlon it park'],
    subtitle: 'Off Western Express Highway, Goregaon East, Mumbai',
    coords: [72.8608, 19.1566],
    category: 'commercial',
  },
  {
    name: 'Mindspace Business Park',
    aliases: ['mindspace', 'mindspace malad', 'malad it park', 'mindspace business park'],
    subtitle: 'Link Road, Malad West, Mumbai',
    coords: [72.8354, 19.1762],
    category: 'commercial',
  },
  {
    name: 'Parinee Crescenzo & One BKC',
    aliases: ['one bkc', 'parinee crescenzo', 'crescenzo bkc', 'bkc commercial tower'],
    subtitle: 'G Block, Bandra Kurla Complex, Mumbai',
    coords: [72.8672, 19.0655],
    category: 'commercial',
  },
  {
    name: 'Peninsula Corporate Park (Lower Parel)',
    aliases: ['peninsula corporate park', 'peninsula park', 'lower parel corporate', 'peninsula parel'],
    subtitle: 'GK Marg, Lower Parel, Mumbai',
    coords: [72.8283, 19.0025],
    category: 'commercial',
  },

  // ── Mumbai Metro Line 2A (Yellow: Dahisar East–D.N. Nagar / Andheri West) ─
  {
    name: 'Lower Oshiwara Metro Station (Line 2A – Yellow)',
    aliases: ['lower oshiwara metro', 'oshiwara metro', 'line 2a oshiwara', 'yellow line oshiwara'],
    subtitle: 'Link Road, Oshiwara, Andheri West, Mumbai',
    coords: [72.8315, 19.1450],
    category: 'station',
  },
  {
    name: 'Borivali West Metro Station (Line 2A – Yellow)',
    aliases: ['borivali west metro', 'don bosco metro', 'line 2a borivali', 'yellow line borivali'],
    subtitle: 'Link Road, Shimpoli, Borivali West, Mumbai',
    coords: [72.8430, 19.2320],
    category: 'station',
  },
  {
    name: 'Kandarpada Metro Station (Line 2A – Yellow)',
    aliases: ['kandarpada metro', 'dahisar west metro', 'line 2a dahisar', 'yellow line dahisar'],
    subtitle: 'Link Road, Kandarpada, Dahisar West, Mumbai',
    coords: [72.8520, 19.2550],
    category: 'station',
  },

  // ── Mumbai Metro Line 9 (Red Extension: Dahisar–Mira Bhayander) ───────────
  {
    name: 'Golden Nest Metro Station (Line 9 – Red Extension)',
    aliases: ['golden nest metro', 'mira road metro', 'line 9 golden nest', 'red line mira bhayander'],
    subtitle: 'Mira Bhayander Road, Golden Nest Circle, Mira Bhayander, Mumbai MMR',
    coords: [72.8570, 19.2950],
    category: 'station',
  },
  {
    name: 'MBMC Subhash Chandra Bose Metro (Line 9)',
    aliases: ['mbmc metro', 'bhayander metro', 'line 9 bhayander', 'subhash chandra bose metro'],
    subtitle: 'Bhayander West, Mira Bhayander, Mumbai MMR',
    coords: [72.8520, 19.3080],
    category: 'station',
  },

  // ── Vile Parle West Healthcare & College Hubs ─────────────────────────────
  {
    name: 'Cooper Hospital & Medical Campus Plaza',
    aliases: ['cooper hospital', 'cooper medical', 'cooper hospital parking', 'jvpg club parking'],
    subtitle: 'U15 Road, Near JVPG Club, Vile Parle West, Mumbai',
    coords: [72.8360, 19.1065],
    category: 'hospital',
  },
  {
    name: 'Mithibai & UPG College Commerce Plaza',
    aliases: ['mithibai', 'mithibai college', 'upg college', 'mithibai parking', 'vl mehta commerce'],
    subtitle: 'V.L. Mehta Road, JVPD Scheme, Vile Parle West, Mumbai',
    coords: [72.8365, 19.1030],
    category: 'university',
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
