import { Destination, TourPackage, FAQItem, Review } from "../types";
import { KWACHA_RATE } from "../lib/currency";

export const CUSTOM_ACTIVITIES = {
  shantumbu: [
    {
      id: "sh-hike",
      name: "Escarpment Ridge Trail Hike",
      description: "Hike along the raw rocky ridge overlooking pristine Zambian valleys with stunning mountain vistas.",
      duration: "3 hours",
      costPerPerson: 25,
      icon: "Footprints",
      category: "nature" as const
    },
    {
      id: "sh-waterfall",
      name: "Waterfall Plunge & Refresh",
      description: "Stand under the refreshing shower sprays of Shantumbu and enjoy our natural rock pools.",
      duration: "2 hours",
      costPerPerson: 15,
      icon: "Waves",
      category: "adventure" as const
    },
    {
      id: "sh-picnic",
      name: "Wilderness Picnic with Snacks & Drinks",
      description: "Relish local snacks and fresh cold drinks in a peaceful environment away from the noise of Lusaka.",
      duration: "1.5 hours",
      costPerPerson: 20,
      icon: "Sparkles",
      category: "luxury" as const
    }
  ],
  vicFalls: [
    {
      id: "vf-heli",
      name: "Flight of Angels Helicopter Ride",
      description: "Savor a breathtaking 15-minute aerial view over the thundering Victoria Falls abyss.",
      duration: "15 mins",
      costPerPerson: 180,
      icon: "Helicopter",
      category: "luxury" as const
    },
    {
      id: "vf-devil",
      name: "Devil's Pool Swim & Livingstone Is.",
      description: "Lean right over the precipice of the world's largest waterfall (seasonal).",
      duration: "3 hours",
      costPerPerson: 120,
      icon: "Waves",
      category: "adventure" as const
    },
    {
      id: "vf-sunset",
      name: "Zambezi Royal Luxury Sunset Cruise",
      description: "Enjoy gourmet highlights and dynamic cocktails while searching for hippos in the sunset.",
      duration: "2 hours",
      costPerPerson: 85,
      icon: "Ship",
      category: "luxury" as const
    },
    {
      id: "vf-bridge",
      name: "Victoria Falls Gorge Bungee Jump",
      description: "Plunge 111 meters off the historic border bridge towards the roaring rapids.",
      duration: "1 hour",
      costPerPerson: 160,
      icon: "Activity",
      category: "adventure" as const
    }
  ],
  southLuangwa: [
    {
      id: "sl-walk",
      name: "Dawn Pioneer Walking Safari",
      description: "The birthplace of walking safaris; trace paw prints on the ground with expert rangers.",
      duration: "4 hours",
      costPerPerson: 90,
      icon: "Footprints",
      category: "nature" as const
    },
    {
      id: "sl-night",
      name: "Nocturnal Wildlife Predator Drive",
      description: "Spot leopards stalking prey with specialized high-contrast biological lighting.",
      duration: "3 hours",
      costPerPerson: 75,
      icon: "Eye",
      category: "adventure" as const
    },
    {
      id: "sl-village",
      name: "Mfuwe Community Heritage Tour",
      description: "Participate in local basket-weaving and meet community leaders at the regional school.",
      duration: "2.5 hours",
      costPerPerson: 40,
      icon: "Users",
      category: "cultural" as const
    }
  ],
  lowerZambezi: [
    {
      id: "lz-canoe",
      name: "Hippo Channels Canoe Safari",
      description: "Paddle silently next to elephants drinking at the edge of beautiful sand-banks.",
      duration: "3 hours",
      costPerPerson: 80,
      icon: "Compass",
      category: "nature" as const
    },
    {
      id: "lz-fish",
      name: "Zambezi Tiger Fishing Challenge",
      description: "Test your skill under strict catch-and-release rules with the legendary, fierce Tigerfish.",
      duration: "4 hours",
      costPerPerson: 110,
      icon: "Fish",
      category: "adventure" as const
    }
  ],
  kundalila: [
    {
      id: "kl-hike",
      name: "Kaombe River Gorge Hike",
      description: "Hike down the historical rocky paths to the bottom of the spectacular 70m canyon.",
      duration: "3 hours",
      costPerPerson: 30,
      icon: "Footprints",
      category: "nature" as const
    },
    {
      id: "kl-swim",
      name: "Deep Pool Swim & Spray Bath",
      description: "Take a refreshing dive in the crystal-clear pool at the base of the waterfall.",
      duration: "2 hours",
      costPerPerson: 15,
      icon: "Waves",
      category: "adventure" as const
    }
  ]
};

export const DESTINATIONS: Destination[] = [
  {
    id: "shantumbu-falls",
    name: "Shantumbu Falls (Hidden Gem)",
    category: "Natural Wonders",
    image: "/images/shantumbufalls1-1.jpg",
    gallery: [
      "/images/shantumbufalls1-1.jpg",
      "/images/shantumbufalls2-1.jpg",
      "/images/shantumbufalls3.jpeg",
      "/images/shantumbufalls4.jpeg"
    ],
    shortDescription: "Discover Shantumbu, a pristine, secluded waterfall and escarpment hike tucked away from the bustle of Lusaka.",
    longDescription: "Tucked within the scenic hills just east of Lusaka, Shantumbu Falls is a breathtaking local hidden gem. It offers a spectacular hiking escarpment, beautiful natural waterfall showers, and a quiet, refreshing environment completely away from the noise of the city. Perfect for group trips, family getaways, and nature lovers seeking untamed peace.",
    location: "Shantumbu Hills, East of Lusaka",
    bestSeason: "All Year Round",
    activityLevel: "Moderate",
    rating: 4.95,
    reviewCount: 48,
    baseCost: 26,
    keyFeatures: [
      "Stunning rocky escarpment hiking",
      "Beautiful falls & refreshing pools",
      "Serene escape from city noise",
      "Snacks, drinks, and transport included"
    ],
    activities: CUSTOM_ACTIVITIES.shantumbu
  },
  {
    id: "kundalila-falls",
    name: "Kundalila Falls",
    category: "Natural Wonders",
    image: "/images/kundalila falls1.jpg",
    gallery: [
      "/images/kundalila falls1.jpg",
      "/images/kundalila falls 2.jpg",
      "/images/kundalila falls 3.jpeg"
    ],
    shortDescription: "A legendary hidden gem in Serenje. Watch Kaombe River plunge over a 70m geological cliff.",
    longDescription: "Located near Serenje in the Central Province of Zambia, Kundalila Falls is a spectacular scenic natural wonder. The Kaombe River breaks over a 70-meter high cliff, cascading down into a crystal-clear, deep cold pool. Surrounded by beautiful wildflower-filled grasslands and rugged hills, it offers pristine hiking trails and breathtaking landscape photography viewpoints.",
    location: "Serenje, Central Province",
    bestSeason: "May to November",
    activityLevel: "Moderate",
    rating: 4.85,
    reviewCount: 36,
    baseCost: 56,
    keyFeatures: [
      "Spectacular 70m vertical water drop",
      "Pristine base pool swim & cold mist spray",
      "Sensational rocky canyon & valley gorge hikes",
      "Scenic picnic spots among rare local flora"
    ],
    activities: CUSTOM_ACTIVITIES.kundalila
  },
  {
    id: "victoria-falls",
    name: "Victoria Falls (Mosi-oa-Tunya)",
    category: "Natural Wonders",
    image: "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
    gallery: [
      "/images/Victoria Falls (Mosi-oa-Tunya) Discovery.webp",
      "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 2.png",
      "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 3.jpg",
      "/images/Victoria Falls (Mosi-oa-Tunya) Discovery 4.jpeg"
    ],
    shortDescription: "Plunge into the thundering smoke of the world's widest natural curtain of falling water.",
    longDescription: "Widely regarded as the adrenaline capital of Africa, Victoria Falls (known locally as Mosi-oa-Tunya, 'The Smoke that Thunders') sits on the border between Zambia and Zimbabwe. Spanning 1.7 kilometers with a drop of over 100 meters, the sheer volume of misty spray can be spotted from 30 kilometers away. Here, wild rivers meet world-class luxury lodges, deep history, and raw extreme adventures.",
    location: "Livingstone, Southern Province",
    bestSeason: "February to August",
    activityLevel: "Moderate",
    rating: 4.9,
    reviewCount: 342,
    baseCost: 450,
    keyFeatures: [
      "Spectacular basalt gorges",
      "Livingstones historical architecture",
      "World-class extreme sports",
      "Devil's Pool safe absolute precipice swim"
    ],
    activities: CUSTOM_ACTIVITIES.vicFalls
  },
  {
    id: "south-luangwa",
    name: "South Luangwa National Park",
    category: "Wildlife Safaris",
    image: "/images/south luangwa .jpeg",
    gallery: [
      "/images/south luangwa .jpeg",
      "/images/south luangwa 2.jpg",
      "/images/south luangwa 3.jpg"
    ],
    shortDescription: "The birthplace of walking safaris, legendary for leopards and pristine riverbeds.",
    longDescription: "South Luangwa National Park is widely accepted as one of the greatest wildlife sanctuaries in the world. Famous for pioneering walking safaris, the park lets travelers experience the bush on foot. The Luangwa River hosts hundreds of hippos and crocodiles, while the surrounding ebony groves provide shelter to one of the highest densities of leopards in Africa.",
    location: "Mfuwe, Eastern Province",
    bestSeason: "June to October (Dry Season)",
    activityLevel: "Challenging",
    rating: 4.95,
    reviewCount: 218,
    baseCost: 650,
    keyFeatures: [
      "Unmatched leopard sightings & nocturnal drives",
      "Pristine dry-season walking safaris",
      "Over 400 species of colorful migratory birds",
      "Iconic luxury riverside elevated wooden decks"
    ],
    activities: CUSTOM_ACTIVITIES.southLuangwa
  },
  {
    id: "lower-zambezi",
    name: "Lower Zambezi National Park",
    category: "Water Adventures",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80",
    shortDescription: "Untamed luxury where the escarpment meets peaceful, wild hippopotamus river channels.",
    longDescription: "Located opposite Zimbabwe's Mana Pools, Lower Zambezi National Park offers a dramatic mountain backdrop slanting down to the wide, gentle waters of the Zambezi River. This pristine wilderness provides a quiet escape where travelers can paddle canoes near massive elephant herds, cast bait for wild tigerfish, or relax on luxury game cruises.",
    location: "Chirundu, Lusaka Province",
    bestSeason: "May to November",
    activityLevel: "Moderate",
    rating: 4.88,
    reviewCount: 145,
    baseCost: 580,
    keyFeatures: [
      "Hippopotamus-dense river_canoe_channels",
      "Premium tiger-fishing championships",
      "Isolated wild island luxury camping sites",
      "Dramatic escarpment mountain climbs"
    ],
    activities: CUSTOM_ACTIVITIES.lowerZambezi
  }
];

export const TOUR_PACKAGES: TourPackage[] = [
  {
    id: "shantumbu-falls-day-tour",
    name: "Hidden Gem Shantumbu Falls Tour",
    tagline: "Hiking scenic escarpments & bathing in waterfalls away from city noise",
    durationDays: 1,
    pricePerPerson: 26,
    destinationId: "shantumbu-falls",
    isFeatured: true,
    features: [
      "Guided rocky hills & scenic escarpment trekking",
      "Shower baths under pristine waterfall cascades",
      "Delicious snacks & chilled local beverages included",
      "Convenient private standard return transport to and from Lusaka"
    ],
    whatToCarry: [
      "Crocs",
      "Hiking shoes",
      "Suncream lotion",
      "Extra drink & snacks",
      "Swimming costumes (optional)",
      "Cooler box",
      "Foldable chair"
    ],
    itinerary: [
      {
        day: 1,
        title: "Escarpment Trails, Beautiful Falls & Quiet Retreat",
        description: "Pickup in Lusaka and drive through the beautiful countryside. Hike the refreshing rocky escarpments, cool off in the beautiful Shantumbu Falls cascades, and enjoy tasty local picnic snacks and drinks.",
        meals: "Snacks / Chilled Drinks"
      }
    ]
  },
  {
    id: "kundalila-falls-camping-tour",
    name: "Kundalila Falls Wilderness Camping Tour",
    tagline: "Overnight star camping near the majestic 70m plunge and pristine Serenje skies",
    durationDays: 2,
    pricePerPerson: 56, // fallback USD value (1400 / 25)
    destinationId: "kundalila-falls",
    isFeatured: true,
    isPreSale: true,
    preSaleAvailability: "March 2027",
    preSalePriceZMW: 1400,
    regularPriceZMW: 3800,
    tourId: "kundalila-camp-mar2027",
    status: "PLANNED",
    unlockCondition: "10 Shantumbu bookings OR Jan 1 2027",
    launchDate: "2027-03-15",
    pricingDetails: {
      standard: 3800,
      currency: "ZMW",
      per: "person",
      minGroup: 4,
      maxGroup: 6,
      deposit: 1900,
      depositPercent: 50
    },
    features: [
      "Guided vertical descent hike into the Kaombe River gorge",
      "Overnight 2-man safari tent setups & sleeping mats",
      "3 hot campfire meals (dinner, breakfast, campfire bush lunch)",
      "High-resolution professional camera photos via WhatsApp",
      "Return transport from Lusaka in 4x4 safari vehicles"
    ],
    detailedIncludes: [
      "Return transport from Lusaka in 4x4",
      "DNPW park entry + overnight camping fees",
      "2-man tent + sleeping mat per person",
      "3 hot meals: dinner, breakfast, bush lunch",
      "Bottled water, coffee, snacks",
      "Professional guide + safety briefing",
      "Campfire + firewood",
      "20+ professional photos delivered via WhatsApp",
      "First aid + emergency comms"
    ],
    detailedExcludes: [
      "Sleeping bag - bring or rent ZK 150",
      "Alcohol - bring your own",
      "Tips - optional"
    ],
    whatToCarry: [
      "Sleeping bag (or rent for K150)",
      "Sturdy hiking shoes & Crocs",
      "Suncream lotion & insect repellent",
      "Water bottles & extra personal beverages",
      "Swimming costumes & towel",
      "Warm night camping apparel",
      "Torches / headlights & powerbanks",
      "Personal foldable chair"
    ],
    detailedItinerary: [
      { day: 1, time: "05:30", activity: "Pickup: Manda Hill / Arcades" },
      { day: 1, time: "09:00", activity: "Arrive Kundalila. Camp setup + breakfast" },
      { day: 1, time: "11:00", activity: "Falls hike, swim, photos" },
      { day: 1, time: "17:00", activity: "Sunset at viewpoint + dinner" },
      { day: 1, time: "20:00", activity: "Campfire stories + stargazing" },
      { day: 2, time: "06:30", activity: "Sunrise coffee + breakfast" },
      { day: 2, time: "09:00", activity: "Final swim + pack camp" },
      { day: 2, time: "11:00", activity: "Depart for Lusaka" },
      { day: 2, time: "15:00", activity: "Drop-off in Lusaka" }
    ],
    itinerary: [
      {
        day: 1,
        title: "Camp Set-Up & Sunset Gorge Descent (05:30 - 20:00)",
        description: "Pick up at 05:30, drive up to Serenje, camp setup, descendent hiking, plunge pools swim, sunset dinner, and campfire stargazing.",
        accommodation: "Wilderness Camping Site (Safari Tents)",
        meals: "Breakfast / Campfire Dinner"
      },
      {
        day: 2,
        title: "Sunrise Explorer & Scenic Return Drive (06:30 - 15:00)",
        description: "Sunrise viewing with bush breakfast, final swim, camp breakdown, departure by 11:00, arrival with drop-offs around 15:00.",
        meals: "Campfire Breakfast / Picnic Snacks"
      }
    ],
    policy: {
      cancellation: "50% refund >14 days. 0% refund <7 days. Rain = full refund if road closed.",
      weather: "Trip runs in light rain. Kundalila best after rains.",
      fitness: "Moderate. 45min hike to base. Age 12+ recommended."
    }
  },
  {
    id: "weekend-explorer",
    name: "Weekend Mosi Explorer",
    tagline: "Uncover the energy and power of the Smoke That Thunders",
    durationDays: 3,
    pricePerPerson: 350,
    destinationId: "victoria-falls",
    isFeatured: false,
    features: [
      "Guided Rainforest Canopy Walkway Tour",
      "2-Nights Premium Standard Livingstone Lodge",
      "Zambezi Sunset Cruise with premium local wine/beer",
      "Complete Airport transfers & regional transports"
    ],
    itinerary: [
      {
        day: 1,
        title: "The Smoke Descends",
        description: "Arrive at Harry Mwaanga Nkumbula Airport, check into your Livingstone Lodge, and board the Royal Sunset Cruise along the Zambezi river.",
        accommodation: "Avani Victoria Falls Resort / Equivalent",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Thunderous Falls and Bridge Jump",
        description: "Experience a private guided tour of the thundering falls and dramatic rainforest walkways, followed by afternoon optional helicopter sweeps or Gorge jumps.",
        accommodation: "Avani Victoria Falls Resort / Equivalent",
        meals: "Breakfast / Lunch"
      },
      {
        day: 3,
        title: "Livingstone Heritage Bidding",
        description: "Venture to the historic Livingstone Museum, purchase hand-carved soapstone crafts at the local market, and transfer to your departure flight.",
        meals: "Breakfast"
      }
    ]
  },
  {
    id: "safari-adventure",
    name: "Luangwa Wild Predator Safari",
    tagline: "Get up close and personal with the leopard capital of Africa",
    durationDays: 7,
    pricePerPerson: 850,
    destinationId: "south-luangwa",
    isFeatured: true,
    features: [
      "Two Daily Walk-Safaris led by veteran game rangers",
      "6-Nights Eco-Luxe Elevated Thatch Lodge",
      "Nightly predator tracking using wildlife safe spotlighting",
      "All high-nutrition organic bush meals and drinks",
      "Mfuwe community schools and weavers local visit"
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival into the Wild",
        description: "Fly into Mfuwe Airport from Lusaka. Drive through local villages to check into your luxury riverside camp. Embark on your first sunset predator drive.",
        accommodation: "Mfuwe Lodge / Flatdogs Camp",
        meals: "Lunch / Dinner"
      },
      {
        day: 2,
        title: "Dawn Walking Safari Roots",
        description: "Rise before sunrise for coffee, then step directly into the wilderness on foot with an armed scout. Observe micro-ecosystems and bird nesting zones.",
        accommodation: "Mfuwe Lodge / Flatdogs Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 3,
        title: "Leopards & Luangwa Nocturnal Hunting",
        description: "Morning game drive searching for hippos in oxbow lagoons. As night falls, join experts using dynamic trackers to spot leopards walking dry river paths.",
        accommodation: "Mfuwe Lodge / Flatdogs Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 4,
        title: "Chamilandu Wilderness Crossing",
        description: "Transfer deeper into South Luangwa to an ultra-remote luxury bushcamp. Enjoy raw evening storytelling huddled around the safari bush hearth.",
        accommodation: "Chamilandu Bushcamp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 5,
        title: "Puku Flats and Elephant Crossroads",
        description: "Participate in a walking safari crossing the shallow Luangwa stream to track breeding herds of buffalos and rare Cookson's wildebeest.",
        accommodation: "Chamilandu Bushcamp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 6,
        title: "Cultural Exchange & Mfuwe Weavers",
        description: "Visit the Project Luangwa school facilities and buy handcrafted textiles, concluding the evening with a majestic sunset dinner overlooking hippo pools.",
        accommodation: "Mfuwe Lodge",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 7,
        title: "Fond Farewell to the Valley",
        description: "Take one final morning drive search, then board your return charter flight to Lusaka for international connections.",
        meals: "Breakfast / Lunch"
      }
    ]
  },
  {
    id: "ultimate-expedition",
    name: "Zambian Rivers & Wilderness Expedition",
    tagline: "The absolute pinnacle of African safaris, covering three dynamic biomes",
    durationDays: 12,
    pricePerPerson: 1650,
    destinationId: "lower-zambezi",
    isFeatured: false,
    features: [
      "3-Nights South Luangwa Leopards Safari",
      "3-Nights Lower Zambezi River Canoe Expedition",
      "3-Nights Busanga Plains Luxury Lion Tracking",
      "2-Nights Livingstone Gorge luxury lodge",
      "All regional domestic flights & boat charters included",
      "Gourmet culinary options prepared by private bush chefs"
    ],
    itinerary: [
      {
        day: 1,
        title: "Lusaka Gateway to Luangwa",
        description: "Fly from Lusaka into South Luangwa. Settle into a riverside chalet and listen to the calling owls as night safari begins.",
        accommodation: "Puku Ridge Camp",
        meals: "Dinner"
      },
      {
        day: 2,
        title: "Walking with Luandwa Giants",
        description: "Experience classic walking trails tracking elephants in acacia wood forests.",
        accommodation: "Puku Ridge Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 3,
        title: "Flight over Escarpment to Zambezi",
        description: "Board a scenic charter flight directly onto the Lower Zambezi river airstrip. Embark on a sunset dynamic deck cruise.",
        accommodation: "Potato Bush Camp",
        meals: "Breakfast / Dinner"
      },
      {
        day: 4,
        title: "Canoeing next to Gentle Behemoths",
        description: "Paddle beautiful narrow lily-channels, watching fish eagles swoop down and elephants swimming across the Zambezi.",
        accommodation: "Potato Bush Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 5,
        title: "Lower Zambezi Predator Trails",
        description: "Combine an early morning wildlife tracking run with an afternoon casting lines for fierce tigerfish.",
        accommodation: "Potato Bush Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 6,
        title: "Journey to the Busanga Horizon",
        description: "Fly to Kafue National Park. Board a safari truck to the remote Busanga Plains, a spectacular oasis holding thousands of lechwe antelopes.",
        accommodation: "Busanga Bush Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 7,
        title: "Tree Lions and Marsh Tracking",
        description: "Spot Kafue's legendary pride of lions known for resting on the branches of sycamore trees.",
        accommodation: "Busanga Bush Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 8,
        title: "Busanga Plains Balloon Drifting",
        description: "Float silently above the rising mists of the plains in a premium hot air balloon, landing for a champagne bush breakfast.",
        accommodation: "Busanga Bush Camp",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 9,
        title: "Fly to Livingstone Thunder",
        description: "Fly to Livingstone. Hear the thundering rumble of Victoria Falls in the distance, settling into a gorgeous lodge on the riverbank.",
        accommodation: "Tongabezi Lodge",
        meals: "Breakfast / Dinner"
      },
      {
        day: 10,
        title: "Mosi-oa-Tunya Explorer",
        description: "Walk inside the misty walkways of Victoria Falls and experience Livingstone town's local history.",
        accommodation: "Tongabezi Lodge",
        meals: "Breakfast / Lunch"
      },
      {
        day: 11,
        title: "Devils Pool and Gorge Dinner",
        description: "Swim in the famous Devil's Pool at the edge of the abyss, and celebrate with a private gorge-side romantic dinner.",
        accommodation: "Tongabezi Lodge",
        meals: "Breakfast / Lunch / Dinner"
      },
      {
        day: 12,
        title: "Farewell African Sun",
        description: "Share packing stories over breakfast, transfer to Livingstone International Airport for your trip home.",
        meals: "Breakfast"
      }
    ]
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "fq-1",
    question: "Is it safe to go on a walking safari in Zambia?",
    answer: "Absolutely! Zambia is the historic home of the walking safari and has the highest safety standard on the continent. Every walk is led by a highly trained, licensed professional guide and accompanied by a fully armed Wildlife Authority Ranger scout. We respect animal zones and follow safe distance rules.",
    category: "safari"
  },
  {
    id: "fq-2",
    question: "When is the best time of year to visit Victoria Falls?",
    answer: "The falls are spectacular all year round, but the experience changes. From February to May, the water flow is at its peak after the rains (expect to get soaked in spray!). From September to December, the flow of water is lower, which is the only time the legendary Devil's Pool is safe for swimming.",
    category: "general"
  },
  {
    id: "fq-3",
    question: "Do I need a visa to enter Zambia?",
    answer: "Zambia provides visa-free entry for citizens of over 100 countries including the United States, Canada, United Kingdom, European Union states, Australia, and GCC nations. For other citizens, a standard e-Visa can be purchased online. We assist all booked travelers with visa guidance documents.",
    category: "booking"
  },
  {
    id: "fq-4",
    question: "What vaccinations or health precautions are required?",
    answer: "We advise consulting with a qualified travel health professional 4-6 weeks before departure. Malaria prevention medication is recommended for most safari camps. If arriving from an area with Yellow Fever transmission, a valid Yellow Fever vaccination certificate is mandatory.",
    category: "health"
  },
  {
    id: "fq-5",
    question: "How do cancellations and custom changes work?",
    answer: "Date rescheduling is 100% free up to 15 days outstanding. After that, a cancellation penalty of 20% of the paid package will be charged before a full refund is given. Our interactive itinerary customizer lets you craft a dream trip which our team reviews in real-time.",
    category: "booking"
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: "rv-shantumbu",
    authorName: "Martha Mwansa",
    authorLocation: "Lusaka, Zambia",
    rating: 5,
    text: "Shantumbu Falls is literally the best kept secret near Lusaka! We spent the day hiking the scenic hills and escarpment, then bathing beneath the fresh waterfalls. Having snacks, drinks, and safe transport to and from Lusaka included in the package made this day-trip incredibly safe, relaxing, and worth every minute.",
    date: "2026-05-20",
    avatarColor: "bg-teal-700",
    verified: true,
    destinationId: "shantumbu-falls"
  },
  {
    id: "rv-1",
    authorName: "Charlotte Vance",
    authorLocation: "Munich, Germany",
    rating: 5,
    text: "Reviewing the South Luangwa Safari: I am speechless. Spotting a mother leopard with her cub on our second night safari was magical. The walking safari made us feel close to nature in a beautiful way. Worth every single cent!",
    date: "2026-04-12",
    avatarColor: "bg-emerald-600",
    verified: true,
    destinationId: "south-luangwa"
  },
  {
    id: "rv-2",
    authorName: "Marcus Sterling",
    authorLocation: "Sydney, Australia",
    rating: 5,
    text: "The thundering noise of Victoria Falls is something I will hear in my dreams forever. Sitting on the precipice at Devil's Pool was incredible! The staff of Dreamscape Tours handled everything seamlessly.",
    date: "2026-05-01",
    avatarColor: "bg-amber-600",
    verified: true,
    destinationId: "victoria-falls"
  },
  {
    id: "rv-3",
    authorName: "Bwalya Mubanga",
    authorLocation: "Copperbelt, Zambia",
    rating: 5,
    text: "We booked the Weekend Mosi Explorer for our wedding anniversary. Dreamscape Tours curated a sunset cruise and dynamic dining in the rainforest that felt like absolute luxury. Great support for domestic travelers!",
    date: "2026-05-18",
    avatarColor: "bg-blue-600",
    verified: true,
    destinationId: "victoria-falls"
  },
  {
    id: "rv-4",
    authorName: "Elena Rostova",
    authorLocation: "Ontario, Canada",
    rating: 4,
    text: "Lower Zambezi is so peaceful. Watching elephants swim across the Zambezi river from our canoe safari is single-handedly the highlight of my trip. The guides are extremely knowledgeable and passionate.",
    date: "2026-05-10",
    avatarColor: "bg-teal-600",
    verified: true,
    destinationId: "lower-zambezi"
  }
];

// In-place conversion of pricing fields to Zambian Kwacha (ZK) at module load
Object.keys(CUSTOM_ACTIVITIES).forEach((key) => {
  const activities = (CUSTOM_ACTIVITIES as any)[key];
  activities.forEach((act: any) => {
    act.costPerPerson = Math.round(act.costPerPerson * KWACHA_RATE);
  });
});

DESTINATIONS.forEach((dest) => {
  dest.baseCost = Math.round(dest.baseCost * KWACHA_RATE);
});

TOUR_PACKAGES.forEach((pkg) => {
  if (pkg.id === "kundalila-falls-camping-tour") {
    const isBeforeMarch6_2027 = new Date().getTime() < new Date("2027-03-06T00:00:00").getTime();
    pkg.pricePerPerson = isBeforeMarch6_2027 ? 1400 : 3800;
  } else {
    pkg.pricePerPerson = Math.round(pkg.pricePerPerson * KWACHA_RATE);
  }
});

