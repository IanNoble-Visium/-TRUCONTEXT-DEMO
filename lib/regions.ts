export interface City {
  name: string
  latitude: number
  longitude: number
}

export interface Region {
  id: string
  name: string
  cities: City[]
}

export const REGIONS: Region[] = [
  {
    id: 'united-states',
    name: 'United States',
    cities: [
      { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
      { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
      { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
      { name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
      { name: 'Phoenix', latitude: 33.4484, longitude: -112.0740 },
      { name: 'Philadelphia', latitude: 39.9526, longitude: -75.1652 },
      { name: 'San Antonio', latitude: 29.4241, longitude: -98.4936 },
      { name: 'San Diego', latitude: 32.7157, longitude: -117.1611 },
      { name: 'Dallas', latitude: 32.7767, longitude: -96.7970 },
      { name: 'San Jose', latitude: 37.3382, longitude: -121.8863 },
      { name: 'Austin', latitude: 30.2672, longitude: -97.7431 },
      { name: 'Jacksonville', latitude: 30.3322, longitude: -81.6557 },
      { name: 'Fort Worth', latitude: 32.7555, longitude: -97.3308 },
      { name: 'Columbus', latitude: 39.9612, longitude: -82.9988 },
      { name: 'Charlotte', latitude: 35.2271, longitude: -80.8431 }
    ]
  },
  {
    id: 'european-union',
    name: 'European Union',
    cities: [
      { name: 'London', latitude: 51.5074, longitude: -0.1278 },
      { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
      { name: 'Berlin', latitude: 52.5200, longitude: 13.4050 },
      { name: 'Madrid', latitude: 40.4168, longitude: -3.7038 },
      { name: 'Rome', latitude: 41.9028, longitude: 12.4964 },
      { name: 'Amsterdam', latitude: 52.3676, longitude: 4.9041 },
      { name: 'Vienna', latitude: 48.2082, longitude: 16.3738 },
      { name: 'Brussels', latitude: 50.8503, longitude: 4.3517 },
      { name: 'Prague', latitude: 50.0755, longitude: 14.4378 },
      { name: 'Warsaw', latitude: 52.2297, longitude: 21.0122 },
      { name: 'Budapest', latitude: 47.4979, longitude: 19.0402 },
      { name: 'Bucharest', latitude: 44.4268, longitude: 26.1025 },
      { name: 'Sofia', latitude: 42.6977, longitude: 23.3219 },
      { name: 'Athens', latitude: 37.9838, longitude: 23.7275 },
      { name: 'Dublin', latitude: 53.3498, longitude: -6.2603 }
    ]
  },
  {
    id: 'africa',
    name: 'Africa',
    cities: [
      { name: 'Cairo', latitude: 30.0444, longitude: 31.2357 },
      { name: 'Johannesburg', latitude: -26.2041, longitude: 28.0473 },
      { name: 'Lagos', latitude: 6.5244, longitude: 3.3792 },
      { name: 'Kinshasa', latitude: -4.4419, longitude: 15.2663 },
      { name: 'Addis Ababa', latitude: 9.1450, longitude: 38.7379 },
      { name: 'Nairobi', latitude: -1.2864, longitude: 36.8172 },
      { name: 'Cape Town', latitude: -33.9249, longitude: 18.4241 },
      { name: 'Casablanca', latitude: 33.5731, longitude: -7.5898 },
      { name: 'Accra', latitude: 5.6037, longitude: -0.1870 },
      { name: 'Tunis', latitude: 36.8065, longitude: 10.1815 },
      { name: 'Algiers', latitude: 36.7538, longitude: 3.0588 },
      { name: 'Dakar', latitude: 14.7167, longitude: -17.4677 },
      { name: 'Luanda', latitude: -8.8147, longitude: 13.2302 },
      { name: 'Khartoum', latitude: 15.5007, longitude: 32.5599 },
      { name: 'Dar es Salaam', latitude: -6.7924, longitude: 39.2083 }
    ]
  },
  {
    id: 'south-america',
    name: 'South America',
    cities: [
      { name: 'São Paulo', latitude: -23.5505, longitude: -46.6333 },
      { name: 'Buenos Aires', latitude: -34.6118, longitude: -58.3966 },
      { name: 'Rio de Janeiro', latitude: -22.9068, longitude: -43.1729 },
      { name: 'Bogotá', latitude: 4.7110, longitude: -74.0721 },
      { name: 'Lima', latitude: -12.0464, longitude: -77.0428 },
      { name: 'Santiago', latitude: -33.4489, longitude: -70.6693 },
      { name: 'Caracas', latitude: 10.4806, longitude: -66.9036 },
      { name: 'Quito', latitude: -0.1807, longitude: -78.4678 },
      { name: 'Montevideo', latitude: -34.9011, longitude: -56.1645 },
      { name: 'La Paz', latitude: -16.4897, longitude: -68.1193 },
      { name: 'Asunción', latitude: -25.2637, longitude: -57.5759 },
      { name: 'Brasília', latitude: -15.8267, longitude: -47.9218 },
      { name: 'Córdoba', latitude: -31.4201, longitude: -64.1888 },
      { name: 'Medellín', latitude: 6.2442, longitude: -75.5812 },
      { name: 'Guayaquil', latitude: -2.1700, longitude: -79.9224 }
    ]
  },
  {
    id: 'asia',
    name: 'Asia',
    cities: [
      { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
      { name: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
      { name: 'Mumbai', latitude: 19.0760, longitude: 72.8777 },
      { name: 'Shanghai', latitude: 31.2304, longitude: 121.4737 },
      { name: 'Beijing', latitude: 39.9042, longitude: 116.4074 },
      { name: 'Seoul', latitude: 37.5665, longitude: 126.9780 },
      { name: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
      { name: 'Jakarta', latitude: -6.2088, longitude: 106.8456 },
      { name: 'Manila', latitude: 14.5995, longitude: 120.9842 },
      { name: 'Bangkok', latitude: 13.7563, longitude: 100.5018 },
      { name: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869 },
      { name: 'Taipei', latitude: 25.0330, longitude: 121.5654 },
      { name: 'Ho Chi Minh City', latitude: 10.8231, longitude: 106.6297 },
      { name: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
      { name: 'Delhi', latitude: 28.7041, longitude: 77.1025 }
    ]
  },
  {
    id: 'oceania',
    name: 'Oceania',
    cities: [
      { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
      { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631 },
      { name: 'Auckland', latitude: -36.8485, longitude: 174.7633 },
      { name: 'Perth', latitude: -31.9505, longitude: 115.8605 },
      { name: 'Brisbane', latitude: -27.4698, longitude: 153.0251 },
      { name: 'Adelaide', latitude: -34.9285, longitude: 138.6007 },
      { name: 'Wellington', latitude: -41.2924, longitude: 174.7787 },
      { name: 'Christchurch', latitude: -43.5320, longitude: 172.6362 },
      { name: 'Hobart', latitude: -42.8821, longitude: 147.3272 },
      { name: 'Darwin', latitude: -12.4634, longitude: 130.8456 },
      { name: 'Cairns', latitude: -16.9186, longitude: 145.7781 },
      { name: 'Gold Coast', latitude: -28.0167, longitude: 153.4000 },
      { name: 'Newcastle', latitude: -32.9283, longitude: 151.7817 },
      { name: 'Wollongong', latitude: -34.4240, longitude: 150.8931 },
      { name: 'Geelong', latitude: -38.1499, longitude: 144.3617 }
    ]
  }
]

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find(region => region.id === id)
}

export function getRandomCityFromRegion(regionId: string): City | null {
  const region = getRegionById(regionId)
  if (!region || region.cities.length === 0) return null

  const randomIndex = Math.floor(Math.random() * region.cities.length)
  return region.cities[randomIndex]
}

export function getAllCitiesFromRegion(regionId: string): City[] {
  const region = getRegionById(regionId)
  return region ? region.cities : []
}