export interface Activity {
  id: string;
  name: string;
  description: string;
  duration: string;
  costPerPerson: number;
  icon: string;
  category: "luxury" | "adventure" | "nature" | "cultural";
}

export interface Destination {
  id: string;
  name: string;
  category: "Wildlife Safaris" | "Natural Wonders" | "Water Adventures" | "Desert & Lakes" | "Cultural Heritage";
  image: string;       // We will select descriptive illustrations/placeholders using nice visual CSS gradients + SVG style
  gallery?: string[];  // Multi-image gallery slideshow assets
  shortDescription: string;
  longDescription: string;
  location: string;
  bestSeason: string;
  activityLevel: "Easy" | "Moderate" | "Challenging" | "High Adventure";
  rating: number;
  reviewCount: number;
  baseCost: number;
  keyFeatures: string[];
  activities: Activity[];
}

export interface DailyItinerary {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string; // e.g. "B, L, D" (Breakfast, Lunch, Dinner)
}

export interface TourPackage {
  id: string;
  name: string;
  tagline: string;
  durationDays: number;
  pricePerPerson: number;
  destinationId: string;
  isFeatured?: boolean;
  features: string[];
  itinerary: DailyItinerary[];
  whatToCarry?: string[];
  isPreSale?: boolean;
  preSaleAvailability?: string;
  preSalePriceZMW?: number;
  regularPriceZMW?: number;
  tourId?: string;
  status?: string;
  unlockCondition?: string;
  launchDate?: string;
  pricingDetails?: {
    standard: number;
    currency: string;
    per: string;
    minGroup: number;
    maxGroup: number;
    deposit: number;
    depositPercent: number;
  };
  detailedIncludes?: string[];
  detailedExcludes?: string[];
  detailedItinerary?: { day: number; time: string; activity: string }[];
  policy?: {
    cancellation: string;
    weather: string;
    fitness: string;
  };
}

export interface Booking {
  id: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  packageId?: string;
  destinationId?: string;
  isCustomTour: boolean;
  customItinerary?: {
    destinationId: string;
    selectedActivityIds: string[];
    daysCount: number;
  };
  preferredStartDate: string;
  guestsCount: number;
  totalPrice: number;
  specialRequests?: string;
  paymentSimulated: boolean;
  status: "pending" | "confirmed" | "cancelled";
  dateBooked: string;
  tourName?: string;
  paymentMethod?: "card" | "whatsapp";
  individualJoiningOthers?: boolean;
}

export interface Review {
  id: string;
  userId?: string;
  authorName: string;
  authorLocation: string;
  rating: number;
  text: string;
  date: string;
  avatarColor: string;
  verified: boolean;
  destinationId?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "booking" | "safari" | "general" | "health";
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  dateSent: string;
}

export interface MediaAsset {
  image_id: string;
  file_name: string;
  storage_path: string;
  public_download_url: string;
  category: "Tour Package" | "Marketing" | "Review Accent" | "Background Asset";
  dimensions?: {
    width_px?: number;
    height_px?: number;
  };
  uploaded_at: string;
}

export interface Membership {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  membershipTier: "savannah_elite" | "kafue_prestige" | "luangwa_imperial";
  plannedSafaris: number;
  specialInterests: string[];
  dietaryPreferences?: string;
  dreamSafari?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}


