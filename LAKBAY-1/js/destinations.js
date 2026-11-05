/**
 * Lakbay - Baguio City & Northern Luzon Tourist Destinations
 * Preloaded dataset conforming to the Event Map and Wireframes
 */

const sampleDestinations = [
  {
    id: 1,
    name: "Mines View Park & Ridge",
    category: "Mountains",
    fee: 20,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    location: "Mines View Ridge, Baguio City, Benguet",
    description: "Perched on a scenic mountain ridge overlooking the abandoned gold and copper mines of Itogon, Benguet and the Cordillera ranges. Known for its cool mountain breezes, observation deck, and souvenir stalls.",
    activities: [
      "Cordillera Overlook View Deck",
      "Traditional Igorot Attire Photo",
      "Silvercraft & Souvenir Shopping",
      "Warm Strawberry Taho Tasting"
    ],
    featured: true
  },
  {
    id: 2,
    name: "Burnham Park & Lake",
    category: "Adventure",
    fee: 0,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
    location: "Jose Abad Santos Drive, Baguio City",
    description: "The historical green heart of Baguio City designed by master architect Daniel Burnham. Centered around a man-made swan boat lagoon surrounded by century-old pines and lively recreation grounds.",
    activities: [
      "Swan Paddleboat Riding",
      "Bicycle Rental & Night Biking",
      "Picnic by the Rose Garden",
      "Outdoor Roller Skating"
    ],
    featured: true
  },
  {
    id: 3,
    name: "The Mansion & Wright Park",
    category: "Historical",
    fee: 0,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    location: "Romulo Drive, Baguio City",
    description: "The official summer palace of the Philippine President, built in 1908. Across the road lies Wright Park with its iconic 100-meter 'Pool of Pines' and traditional horseback riding stables.",
    activities: [
      "Historical Ornate Gate Sightseeing",
      "Horseback Riding with Local Pony Boys",
      "Stroll along the Pool of Pines",
      "Pine Forest Photography"
    ],
    featured: true
  },
  {
    id: 4,
    name: "Camp John Hay Pine Trails",
    category: "Adventure",
    fee: 80,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80",
    location: "Loakan Road, Camp John Hay, Baguio City",
    description: "A former US military R&R base transformed into a serene pine eco-park. Features scenic forest hiking trails, treetop suspension bridges, historical cottages, and tranquil coffee patios.",
    activities: [
      "Yellow Trail Pine Hike",
      "Treetop Adventure Canopy Walk",
      "Bell Amphitheater Picnic",
      "Historical Core & Secret Garden Tour"
    ],
    featured: false
  },
  {
    id: 5,
    name: "Mirador Heritage & Eco Park",
    category: "Mountains",
    fee: 100,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    location: "Mirador Hill, Baguio City",
    description: "A 5-hectare eco-spirituality park situated atop Mirador Hill. Renowned for its iconic Torii Gate overlooking the mountain horizon, Arashiyama-inspired bamboo grove, and historical peace bell.",
    activities: [
      "Torii Gate Mountain Horizon Photo",
      "Arashiyama Bamboo Grove Walk",
      "Peace Memorial Bell Ringing",
      "Sunset Panoramic View of Baguio"
    ],
    featured: false
  },
  {
    id: 6,
    name: "Tam-awan Indigenous Village",
    category: "Historical",
    fee: 60,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    location: "Pinsao Proper, Baguio City",
    description: "An artist sanctuary and living museum dedicated to indigenous Cordilleran culture. Features reconstructed native Ifugao and Kalinga huts, art galleries, and traditional cultural performances.",
    activities: [
      "Authentic Ifugao & Kalinga Huts Tour",
      "Cordillera Art Exhibit Viewing",
      "Native Benguet Coffee Tasting",
      "Indigenous Craft Workshops"
    ],
    featured: false
  },
  {
    id: 7,
    name: "Baguio Botanical Garden",
    category: "Historical",
    fee: 10,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80",
    location: "37 Leonard Wood Road, Baguio City",
    description: "Also known as Centennial Park, showcasing indigenous Cordilleran tribal statues, exotic pine flora, tranquil pocket gardens, and an authentic WWII Japanese subterranean tunnel.",
    activities: [
      "Japanese WWII Tunnel Exploration",
      "Cordillera Tribal Sculptures Tour",
      "Flower Nursery & Succulent Browsing",
      "Taebaek & Friendship Gardens Walk"
    ],
    featured: false
  },
  {
    id: 8,
    name: "San Juan Surf Beach (Coastal Gateway)",
    category: "Beaches",
    fee: 0,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    location: "Urbiztondo, San Juan, La Union (1.5h from Baguio)",
    description: "The surfing capital of Northern Luzon, situated right at the foot of the Cordillera mountain range down Marcos Highway. The premier beach excursion for Baguio holidaymakers.",
    activities: [
      "Beginner & Advanced Surfing Lessons",
      "Golden Hour Sunset Viewing",
      "Beachfront Cafe & Dining Hopping",
      "Coastal Beachcombing"
    ],
    featured: false
  }
];
