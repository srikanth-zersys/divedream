<?php

namespace Database\Seeders;

use App\Models\Boat;
use App\Models\DiveSite;
use App\Models\Equipment;
use App\Models\EquipmentCategory;
use App\Models\Instructor;
use App\Models\Location;
use App\Models\Member;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoTenantSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo tenant
        $tenant = Tenant::create([
            'name' => 'Blue Ocean Diving',
            'slug' => 'blue-ocean-diving',
            'subdomain' => 'blue-ocean',
            'email' => 'info@blueoceandiving.com',
            'phone' => '+1 (555) 123-4567',
            'timezone' => 'America/New_York',
            'currency' => 'USD',
            'plan' => 'growth',
            'trial_ends_at' => now()->addDays(14),
            'status' => 'active',
            'primary_color' => '#0066CC',
            'secondary_color' => '#004499',
        ]);

        // Create owner user
        $owner = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'John Owner',
            'email' => 'owner@blueoceandiving.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);
        $owner->assignRole('owner');

        // Create first location
        $location1 = Location::create([
            'tenant_id' => $tenant->id,
            'name' => 'Blue Ocean - Miami Beach',
            'slug' => 'miami-beach',
            'email' => 'miami@blueoceandiving.com',
            'phone' => '+1 (555) 123-4567',
            'address_line_1' => '123 Ocean Drive',
            'city' => 'Miami Beach',
            'state' => 'FL',
            'postal_code' => '33139',
            'country' => 'US',
            'latitude' => 25.7907,
            'longitude' => -80.1300,
            'require_waiver' => true,
            'require_medical_form' => true,
            'is_active' => true,
        ]);

        // Create second location
        $location2 = Location::create([
            'tenant_id' => $tenant->id,
            'name' => 'Blue Ocean - Key Largo',
            'slug' => 'key-largo',
            'email' => 'keylargo@blueoceandiving.com',
            'phone' => '+1 (555) 234-5678',
            'address_line_1' => '456 Overseas Hwy',
            'city' => 'Key Largo',
            'state' => 'FL',
            'postal_code' => '33037',
            'country' => 'US',
            'latitude' => 25.0865,
            'longitude' => -80.4473,
            'require_waiver' => true,
            'require_medical_form' => true,
            'is_active' => true,
        ]);

        // Attach owner to both locations
        $owner->locations()->attach([$location1->id, $location2->id], ['is_primary' => true]);

        // Create admin user
        $admin = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Sarah Admin',
            'email' => 'admin@blueoceandiving.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);
        $admin->assignRole('admin');
        $admin->locations()->attach([$location1->id, $location2->id]);

        // Create manager for Miami
        $manager = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Mike Manager',
            'email' => 'manager@blueoceandiving.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);
        $manager->assignRole('manager');
        $manager->locations()->attach([$location1->id], ['is_primary' => true]);

        // Create staff
        $staff = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Emily Staff',
            'email' => 'staff@blueoceandiving.com',
            'password' => Hash::make('password'),
            'status' => 'Active',
        ]);
        $staff->assignRole('staff');
        $staff->locations()->attach([$location1->id], ['is_primary' => true]);

        // Create instructors
        $instructor1 = Instructor::create([
            'tenant_id' => $tenant->id,
            'first_name' => 'David',
            'last_name' => 'Dive',
            'email' => 'david@blueoceandiving.com',
            'phone' => '+1 (555) 345-6789',
            'instructor_agency' => 'PADI',
            'instructor_number' => 'PADI-123456',
            'instructor_level' => 'MSDT',
            'instructor_cert_expiry' => now()->addYear(),
            'teaching_certifications' => ['OWD', 'AOWD', 'RD', 'EANx', 'DEEP'],
            'languages' => ['en', 'es'],
            'employment_type' => 'full_time',
            'calendar_color' => '#3B82F6',
            'status' => 'active',
        ]);
        $instructor1->locations()->attach([$location1->id, $location2->id], ['is_primary' => true]);

        $instructor2 = Instructor::create([
            'tenant_id' => $tenant->id,
            'first_name' => 'Maria',
            'last_name' => 'Marine',
            'email' => 'maria@blueoceandiving.com',
            'phone' => '+1 (555) 456-7890',
            'instructor_agency' => 'PADI',
            'instructor_number' => 'PADI-234567',
            'instructor_level' => 'OWSI',
            'instructor_cert_expiry' => now()->addYear(),
            'teaching_certifications' => ['OWD', 'AOWD', 'NIGHT'],
            'languages' => ['en', 'pt'],
            'employment_type' => 'full_time',
            'calendar_color' => '#10B981',
            'status' => 'active',
        ]);
        $instructor2->locations()->attach([$location1->id], ['is_primary' => true]);

        // Create boats
        Boat::create([
            'tenant_id' => $tenant->id,
            'location_id' => $location1->id,
            'name' => 'Ocean Explorer',
            'registration_number' => 'FL-12345',
            'type' => 'Catamaran',
            'max_passengers' => 24,
            'max_divers' => 20,
            'crew_count' => 3,
            'has_toilet' => true,
            'has_shower' => true,
            'amenities' => ['Sun deck', 'Fresh water rinse', 'Snacks'],
            'status' => 'active',
        ]);

        Boat::create([
            'tenant_id' => $tenant->id,
            'location_id' => $location2->id,
            'name' => 'Reef Runner',
            'registration_number' => 'FL-23456',
            'type' => 'Speedboat',
            'max_passengers' => 12,
            'max_divers' => 10,
            'crew_count' => 2,
            'has_toilet' => true,
            'has_shower' => false,
            'status' => 'active',
        ]);

        // Create dive sites
        DiveSite::create([
            'tenant_id' => $tenant->id,
            'location_id' => $location1->id,
            'name' => 'Emerald Reef',
            'slug' => 'emerald-reef',
            'description' => 'Beautiful coral reef with abundant marine life.',
            'min_depth_meters' => 8,
            'max_depth_meters' => 18,
            'difficulty' => 'beginner',
            'dive_types' => ['reef'],
            'marine_life' => ['Tropical fish', 'Sea turtles', 'Rays'],
            'current_strength' => 'weak',
            'visibility' => 'excellent',
            'distance_from_shore_minutes' => 20,
            'is_active' => true,
        ]);

        DiveSite::create([
            'tenant_id' => $tenant->id,
            'location_id' => $location1->id,
            'name' => 'Neptune\'s Wall',
            'slug' => 'neptunes-wall',
            'description' => 'Dramatic wall dive with drop-off to 40m+.',
            'min_depth_meters' => 15,
            'max_depth_meters' => 40,
            'difficulty' => 'advanced',
            'minimum_certification' => 'AOWD',
            'dive_types' => ['wall', 'deep'],
            'marine_life' => ['Sharks', 'Barracuda', 'Eagle rays'],
            'current_strength' => 'moderate',
            'visibility' => 'good',
            'distance_from_shore_minutes' => 35,
            'is_active' => true,
        ]);

        DiveSite::create([
            'tenant_id' => $tenant->id,
            'location_id' => $location2->id,
            'name' => 'Christ of the Abyss',
            'slug' => 'christ-of-the-abyss',
            'description' => 'Famous underwater statue in Key Largo.',
            'min_depth_meters' => 6,
            'max_depth_meters' => 8,
            'difficulty' => 'beginner',
            'dive_types' => ['reef'],
            'marine_life' => ['Tropical fish', 'Grouper'],
            'current_strength' => 'weak',
            'visibility' => 'excellent',
            'distance_from_shore_minutes' => 15,
            'is_active' => true,
        ]);

        // Create products
        $funDive = Product::create([
            'tenant_id' => $tenant->id,
            'name' => '2-Tank Fun Dive',
            'slug' => '2-tank-fun-dive',
            'short_description' => 'Two dive trip to our best sites',
            'description' => 'Join us for a morning of diving at two of our most popular dive sites. Equipment available for rent.',
            'type' => 'fun_dive',
            'price' => 95.00,
            'price_type' => 'per_person',
            'min_participants' => 1,
            'max_participants' => 20,
            'duration_minutes' => 240,
            'minimum_certification' => 'OWD',
            'equipment_included' => false,
            'includes' => ['2 guided dives', 'Tanks & weights', 'Snacks & water'],
            'excludes' => ['Equipment rental', 'Photos'],
            'status' => 'active',
            'is_featured' => true,
            'show_on_website' => true,
        ]);
        $funDive->locations()->attach([$location1->id, $location2->id], ['is_available' => true]);

        $discoverScuba = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'Discover Scuba Diving',
            'slug' => 'discover-scuba-diving',
            'short_description' => 'Try diving for the first time!',
            'description' => 'Perfect introduction to scuba diving. No experience or certification required. Includes pool session and one ocean dive.',
            'type' => 'discover_scuba',
            'price' => 150.00,
            'price_type' => 'per_person',
            'min_participants' => 1,
            'max_participants' => 4,
            'duration_minutes' => 180,
            'minimum_age' => 10,
            'equipment_included' => true,
            'includes' => ['All equipment', 'Pool session', 'Ocean dive', 'Instructor', 'Photos'],
            'status' => 'active',
            'is_featured' => true,
            'show_on_website' => true,
        ]);
        $discoverScuba->locations()->attach([$location1->id, $location2->id], ['is_available' => true]);

        $owdCourse = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'PADI Open Water Diver Course',
            'slug' => 'padi-open-water-course',
            'short_description' => 'Get certified to dive anywhere in the world',
            'description' => 'The world\'s most popular and widely recognized scuba certification. Includes classroom, pool sessions, and 4 open water dives.',
            'type' => 'course',
            'price' => 495.00,
            'price_type' => 'per_person',
            'min_participants' => 1,
            'max_participants' => 6,
            'duration_days' => 3,
            'minimum_age' => 10,
            'requires_medical_clearance' => true,
            'equipment_included' => true,
            'pool_sessions' => 5,
            'open_water_dives' => 4,
            'certification_issued' => 'PADI Open Water Diver',
            'includes' => ['All equipment', 'PADI eLearning', 'Certification fee', 'Pool sessions', '4 ocean dives'],
            'status' => 'active',
            'is_featured' => true,
            'show_on_website' => true,
        ]);
        $owdCourse->locations()->attach([$location1->id, $location2->id], ['is_available' => true]);

        $nitroxCourse = Product::create([
            'tenant_id' => $tenant->id,
            'name' => 'PADI Enriched Air Nitrox',
            'slug' => 'padi-nitrox-course',
            'short_description' => 'Extend your dive times with Nitrox',
            'description' => 'Learn to dive with enriched air for longer bottom times and shorter surface intervals.',
            'type' => 'course',
            'price' => 175.00,
            'price_type' => 'per_person',
            'min_participants' => 1,
            'max_participants' => 8,
            'duration_minutes' => 240,
            'minimum_certification' => 'OWD',
            'equipment_included' => false,
            'certification_issued' => 'PADI Enriched Air Nitrox',
            'includes' => ['PADI eLearning', 'Certification fee'],
            'status' => 'active',
            'show_on_website' => true,
        ]);
        $nitroxCourse->locations()->attach([$location1->id, $location2->id], ['is_available' => true]);

        // Create equipment
        $categories = EquipmentCategory::all()->keyBy('slug');

        // BCDs
        foreach (['S', 'M', 'L', 'XL'] as $i => $size) {
            for ($j = 1; $j <= 3; $j++) {
                Equipment::create([
                    'tenant_id' => $tenant->id,
                    'location_id' => $location1->id,
                    'equipment_category_id' => $categories['bcd']->id,
                    'name' => "BCD {$size} #{$j}",
                    'code' => "BCD-{$size}-{$j}",
                    'brand' => 'Aqualung',
                    'model' => 'Pro HD',
                    'size' => $size,
                    'condition' => 'good',
                    'is_available_for_rental' => true,
                    'rental_price_per_dive' => 15.00,
                    'status' => 'available',
                ]);
            }
        }

        // Regulators
        for ($i = 1; $i <= 10; $i++) {
            Equipment::create([
                'tenant_id' => $tenant->id,
                'location_id' => $location1->id,
                'equipment_category_id' => $categories['regulator']->id,
                'name' => "Regulator Set #{$i}",
                'code' => "REG-{$i}",
                'brand' => 'Scubapro',
                'model' => 'MK25/S600',
                'condition' => 'good',
                'is_available_for_rental' => true,
                'rental_price_per_dive' => 20.00,
                'status' => 'available',
            ]);
        }

        // Wetsuits
        foreach (['S', 'M', 'L', 'XL'] as $size) {
            for ($j = 1; $j <= 4; $j++) {
                Equipment::create([
                    'tenant_id' => $tenant->id,
                    'location_id' => $location1->id,
                    'equipment_category_id' => $categories['wetsuit']->id,
                    'name' => "Wetsuit 3mm {$size} #{$j}",
                    'code' => "WS-{$size}-{$j}",
                    'brand' => 'Mares',
                    'model' => 'Flexa 3.2.2',
                    'size' => $size,
                    'condition' => 'good',
                    'is_available_for_rental' => true,
                    'rental_price_per_dive' => 10.00,
                    'status' => 'available',
                ]);
            }
        }

        // Create some members
        $members = [
            ['first_name' => 'Alice', 'last_name' => 'Anderson', 'email' => 'alice@example.com', 'total_dives' => 45],
            ['first_name' => 'Bob', 'last_name' => 'Brown', 'email' => 'bob@example.com', 'total_dives' => 12],
            ['first_name' => 'Carol', 'last_name' => 'Clark', 'email' => 'carol@example.com', 'total_dives' => 0],
            ['first_name' => 'Dan', 'last_name' => 'Davis', 'email' => 'dan@example.com', 'total_dives' => 150],
            ['first_name' => 'Emma', 'last_name' => 'Evans', 'email' => 'emma@example.com', 'total_dives' => 8],
        ];

        foreach ($members as $memberData) {
            Member::create(array_merge($memberData, [
                'tenant_id' => $tenant->id,
                'status' => 'active',
            ]));
        }

        $this->command->info('Demo tenant seeded successfully!');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Owner: owner@blueoceandiving.com / password');
        $this->command->info('Admin: admin@blueoceandiving.com / password');
        $this->command->info('Manager: manager@blueoceandiving.com / password');
        $this->command->info('Staff: staff@blueoceandiving.com / password');
    }
}
