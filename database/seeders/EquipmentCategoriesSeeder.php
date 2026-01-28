<?php

namespace Database\Seeders;

use App\Models\EquipmentCategory;
use Illuminate\Database\Seeder;

class EquipmentCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'BCD',
                'slug' => 'bcd',
                'description' => 'Buoyancy Control Device',
                'track_sizes' => true,
                'available_sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                'requires_service' => true,
                'service_interval_months' => 12,
                'sort_order' => 1,
            ],
            [
                'name' => 'Regulator',
                'slug' => 'regulator',
                'description' => 'Primary and secondary regulator set',
                'track_sizes' => false,
                'requires_service' => true,
                'service_interval_months' => 12,
                'sort_order' => 2,
            ],
            [
                'name' => 'Wetsuit',
                'slug' => 'wetsuit',
                'description' => 'Full wetsuit',
                'track_sizes' => true,
                'available_sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
                'requires_service' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Shorty',
                'slug' => 'shorty',
                'description' => 'Short wetsuit',
                'track_sizes' => true,
                'available_sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                'requires_service' => false,
                'sort_order' => 4,
            ],
            [
                'name' => 'Mask',
                'slug' => 'mask',
                'description' => 'Diving mask',
                'track_sizes' => false,
                'requires_service' => false,
                'sort_order' => 5,
            ],
            [
                'name' => 'Fins',
                'slug' => 'fins',
                'description' => 'Diving fins',
                'track_sizes' => true,
                'available_sizes' => ['XS', 'S', 'M', 'L', 'XL'],
                'requires_service' => false,
                'sort_order' => 6,
            ],
            [
                'name' => 'Booties',
                'slug' => 'booties',
                'description' => 'Dive booties/boots',
                'track_sizes' => true,
                'available_sizes' => ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
                'requires_service' => false,
                'sort_order' => 7,
            ],
            [
                'name' => 'Weight Belt',
                'slug' => 'weight-belt',
                'description' => 'Weight belt with weights',
                'track_sizes' => false,
                'requires_service' => false,
                'sort_order' => 8,
            ],
            [
                'name' => 'Tank',
                'slug' => 'tank',
                'description' => 'Scuba tank/cylinder',
                'track_sizes' => true,
                'available_sizes' => ['10L', '12L', '15L'],
                'requires_service' => true,
                'service_interval_months' => 12,
                'sort_order' => 9,
            ],
            [
                'name' => 'Dive Computer',
                'slug' => 'dive-computer',
                'description' => 'Wrist or console dive computer',
                'track_sizes' => false,
                'requires_service' => true,
                'service_interval_months' => 24,
                'sort_order' => 10,
            ],
            [
                'name' => 'Torch',
                'slug' => 'torch',
                'description' => 'Underwater torch/flashlight',
                'track_sizes' => false,
                'requires_service' => false,
                'sort_order' => 11,
            ],
            [
                'name' => 'SMB',
                'slug' => 'smb',
                'description' => 'Surface Marker Buoy',
                'track_sizes' => false,
                'requires_service' => false,
                'sort_order' => 12,
            ],
            [
                'name' => 'Camera',
                'slug' => 'camera',
                'description' => 'Underwater camera',
                'track_sizes' => false,
                'requires_service' => false,
                'sort_order' => 13,
            ],
        ];

        foreach ($categories as $category) {
            EquipmentCategory::updateOrCreate(
                ['slug' => $category['slug']],
                $category
            );
        }

        $this->command->info('Equipment categories seeded successfully!');
    }
}
