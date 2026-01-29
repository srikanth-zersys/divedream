// Dive Club SaaS TypeScript Types

// Base types
export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

// Tenant
export interface Tenant {
  id: number;
  name: string;
  slug: string;
  subdomain: string;
  logo: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: string;
  plan: 'starter' | 'growth' | 'enterprise';
  trial_ends_at: string | null;
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  primary_color: string;
  secondary_color: string;
  is_single_location: boolean;
  created_at: string;
  updated_at: string;
}

// Location
export interface Location {
  id: number;
  tenant_id: number;
  name: string;
  slug: string;
  description: string | null;
  email: string;
  phone: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User (extended)
export interface User {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  role: string;
  roles: string[];
  permissions: string[];
  is_owner: boolean;
  is_admin: boolean;
  is_instructor: boolean;
}

// Member
export interface Member {
  id: number;
  tenant_id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  total_dives: number;
  last_dive_date: string | null;
  notes: string | null;
  tags: string[] | null;
  status: 'active' | 'inactive' | 'blacklisted';
  certifications?: MemberCertification[];
  created_at: string;
  updated_at: string;
}

// Certification Type
export interface CertificationType {
  id: number;
  agency: string;
  code: string;
  name: string;
  level: number;
  color: string;
}

// Member Certification
export interface MemberCertification {
  id: number;
  member_id: number;
  certification_type_id: number;
  certification_number: string | null;
  certification_date: string | null;
  expiry_date: string | null;
  is_verified: boolean;
  verified_at: string | null;
  certification_type?: CertificationType;
}

// Instructor
export interface Instructor {
  id: number;
  tenant_id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  bio: string | null;
  languages: string[] | null;
  employment_type: 'full_time' | 'part_time' | 'contractor' | 'freelance';
  instructor_agency: string | null;
  instructor_number: string | null;
  instructor_level: string | null;
  instructor_cert_expiry: string | null;
  teaching_certifications: string[] | null;
  calendar_color: string;
  status: 'active' | 'inactive' | 'on_leave';
  locations?: Location[];
  created_at: string;
  updated_at: string;
}

// Product
export interface Product {
  id: number;
  tenant_id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  type: 'fun_dive' | 'course' | 'discover_scuba' | 'private_trip' | 'boat_charter' | 'equipment_rental' | 'other';
  category: string | null;
  price: number;
  compare_at_price: number | null;
  price_type: 'per_person' | 'per_group' | 'flat_rate';
  min_participants: number;
  max_participants: number;
  duration_minutes: number | null;
  duration_days: number | null;
  minimum_certification: string | null;
  minimum_age: number | null;
  minimum_dives: number | null;
  requires_medical_clearance: boolean;
  equipment_included: boolean;
  includes: string[] | null;
  excludes: string[] | null;
  image: string | null;
  gallery: string[] | null;
  is_featured: boolean;
  show_on_website: boolean;
  status: 'active' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

// Schedule
export interface Schedule {
  id: number;
  tenant_id: number;
  location_id: number | null;
  product_id: number;
  instructor_id: number | null;
  boat_id: number | null;
  dive_site_id: number | null;
  date: string;
  start_time: string;
  end_time: string | null;
  max_participants: number;
  min_participants: number;
  price_override: number | null;
  notes: string | null;
  internal_notes: string | null;
  is_private: boolean;
  allow_online_booking: boolean;
  status: 'active' | 'cancelled' | 'completed';
  product?: Product;
  instructor?: Instructor;
  boat?: Boat;
  dive_site?: DiveSite;
  location?: Location;
  bookings?: Booking[];
  booked_count?: number;
  available_spots?: number;
  created_at: string;
  updated_at: string;
}

// Boat
export interface Boat {
  id: number;
  tenant_id: number;
  location_id: number;
  name: string;
  registration_number: string | null;
  type: string | null;
  max_passengers: number;
  max_divers: number;
  crew_count: number;
  has_toilet: boolean;
  has_shower: boolean;
  amenities: string[] | null;
  image: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Dive Site
export interface DiveSite {
  id: number;
  tenant_id: number;
  location_id: number;
  name: string;
  slug: string;
  description: string | null;
  min_depth_meters: number | null;
  max_depth_meters: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  minimum_certification: string | null;
  dive_types: string[] | null;
  marine_life: string[] | null;
  current_strength: 'none' | 'weak' | 'moderate' | 'strong' | 'variable';
  visibility: 'poor' | 'fair' | 'good' | 'excellent' | 'variable';
  distance_from_shore_minutes: number | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  gallery: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Booking
export interface Booking {
  id: number;
  tenant_id: number;
  location_id: number | null;
  member_id: number | null;
  product_id: number;
  schedule_id: number | null;
  booking_number: string;
  booking_date: string;
  participant_count: number;
  subtotal: number;
  discount_amount: number;
  discount_code: string | null;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  special_requests: string | null;
  internal_notes: string | null;
  source: 'admin' | 'website' | 'phone' | 'walk_in' | 'partner';
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'refunded';
  waiver_completed: boolean;
  waiver_completed_at: string | null;
  medical_form_completed: boolean;
  checked_in_at: string | null;
  checked_out_at: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  member?: Member;
  product?: Product;
  schedule?: Schedule;
  location?: Location;
  participants?: BookingParticipant[];
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

// Booking Participant
export interface BookingParticipant {
  id: number;
  booking_id: number;
  member_id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
  certification_level: string | null;
  certification_number: string | null;
  date_of_birth: string | null;
  waiver_signed: boolean;
  medical_cleared: boolean;
  member?: Member;
}

// Payment
export interface Payment {
  id: number;
  tenant_id: number;
  location_id: number | null;
  booking_id: number;
  amount: number;
  currency: string;
  method: 'cash' | 'card' | 'bank_transfer' | 'online' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'partial_refund';
  reference: string | null;
  stripe_payment_intent_id: string | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// Equipment Category
export interface EquipmentCategory {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

// Equipment
export interface Equipment {
  id: number;
  tenant_id: number;
  location_id: number;
  equipment_category_id: number;
  name: string;
  code: string;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  size: string | null;
  color: string | null;
  condition: 'new' | 'good' | 'fair' | 'needs_service' | 'retired';
  purchase_date: string | null;
  purchase_price: number | null;
  last_service_date: string | null;
  next_service_date: string | null;
  usage_count: number;
  is_available_for_rental: boolean;
  rental_price_per_dive: number | null;
  rental_price_per_day: number | null;
  notes: string | null;
  status: 'available' | 'in_use' | 'reserved' | 'maintenance' | 'retired';
  category?: EquipmentCategory;
  location?: Location;
  created_at: string;
  updated_at: string;
}

// Dashboard Stats
export interface DashboardStats {
  today: {
    bookings: number;
    checkIns: number;
    pendingCheckIns: number;
    missingWaivers: number;
    missingMedicalForms: number;
  };
  week: {
    bookings: number;
    revenue: number;
  };
  month: {
    bookings: number;
    revenue: number;
    newMembers: number;
  };
}

// Calendar Event
export interface CalendarEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: {
    productId?: number;
    productType?: string;
    instructor?: string;
    instructorId?: number;
    booked?: number;
    capacity?: number;
    available?: number;
    status?: string;
    isFull?: boolean;
  };
}

// Chart Data
export interface ChartDataPoint {
  date: string;
  revenue?: number;
  bookings?: number;
  [key: string]: any;
}

// Filters
export interface BookingFilters {
  search?: string;
  status?: string;
  product_id?: string;
  date_from?: string;
  date_to?: string;
  payment_status?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface MemberFilters {
  search?: string;
  status?: string;
  certification?: string;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface ScheduleFilters {
  date_from?: string;
  date_to?: string;
  product_id?: string;
  instructor_id?: string;
  status?: string;
}

// Form types
export interface BookingFormData {
  member_id?: number | null;
  product_id: number;
  schedule_id?: number | null;
  booking_date: string;
  participant_count: number;
  special_requests?: string;
  internal_notes?: string;
  source: 'admin' | 'website' | 'phone' | 'walk_in' | 'partner';
  new_member?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  participants?: {
    name: string;
    email?: string;
    certification_level?: string;
  }[];
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  medical_conditions?: string;
  allergies?: string;
  total_dives?: number;
  last_dive_date?: string;
  notes?: string;
  tags?: string[];
  marketing_consent?: boolean;
  certifications?: {
    certification_type_id: number;
    certification_number?: string;
    certification_date?: string;
    expiry_date?: string;
  }[];
}

// Page Props (shared data)
export interface PageProps {
  auth: {
    user: User | null;
  };
  tenant: Tenant | null;
  location: Location | null;
  locations: Pick<Location, 'id' | 'name' | 'slug' | 'is_active'>[];
  showLocationSwitcher: boolean;
  ziggy: {
    url: string;
    location: string;
  };
  flash: {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
  };
  app: {
    name: string;
    version: string;
  };
}
