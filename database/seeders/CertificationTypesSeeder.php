<?php

namespace Database\Seeders;

use App\Models\CertificationType;
use Illuminate\Database\Seeder;

class CertificationTypesSeeder extends Seeder
{
    public function run(): void
    {
        $certifications = [
            // PADI Certifications
            ['agency' => 'PADI', 'name' => 'Scuba Diver', 'code' => 'SD', 'minimum_age' => 10, 'minimum_dives' => 0, 'sort_order' => 1],
            ['agency' => 'PADI', 'name' => 'Open Water Diver', 'code' => 'OWD', 'minimum_age' => 10, 'minimum_dives' => 0, 'prerequisite_code' => null, 'sort_order' => 2],
            ['agency' => 'PADI', 'name' => 'Advanced Open Water Diver', 'code' => 'AOWD', 'minimum_age' => 12, 'minimum_dives' => 0, 'prerequisite_code' => 'OWD', 'sort_order' => 3],
            ['agency' => 'PADI', 'name' => 'Rescue Diver', 'code' => 'RD', 'minimum_age' => 12, 'minimum_dives' => 0, 'prerequisite_code' => 'AOWD', 'sort_order' => 4],
            ['agency' => 'PADI', 'name' => 'Master Scuba Diver', 'code' => 'MSD', 'minimum_age' => 12, 'minimum_dives' => 50, 'prerequisite_code' => 'RD', 'sort_order' => 5],
            ['agency' => 'PADI', 'name' => 'Divemaster', 'code' => 'DM', 'minimum_age' => 18, 'minimum_dives' => 40, 'prerequisite_code' => 'RD', 'is_instructor_level' => true, 'sort_order' => 10],
            ['agency' => 'PADI', 'name' => 'Open Water Scuba Instructor', 'code' => 'OWSI', 'minimum_age' => 18, 'minimum_dives' => 60, 'prerequisite_code' => 'DM', 'is_instructor_level' => true, 'sort_order' => 11],
            ['agency' => 'PADI', 'name' => 'Master Scuba Diver Trainer', 'code' => 'MSDT', 'minimum_age' => 18, 'minimum_dives' => 100, 'prerequisite_code' => 'OWSI', 'is_instructor_level' => true, 'sort_order' => 12],
            ['agency' => 'PADI', 'name' => 'IDC Staff Instructor', 'code' => 'IDCSI', 'minimum_age' => 18, 'minimum_dives' => 100, 'prerequisite_code' => 'MSDT', 'is_instructor_level' => true, 'sort_order' => 13],
            ['agency' => 'PADI', 'name' => 'Course Director', 'code' => 'CD', 'minimum_age' => 18, 'minimum_dives' => 150, 'prerequisite_code' => 'IDCSI', 'is_instructor_level' => true, 'sort_order' => 14],

            // PADI Specialty Certifications
            ['agency' => 'PADI', 'name' => 'Enriched Air Nitrox', 'code' => 'EANx', 'minimum_age' => 12, 'sort_order' => 20],
            ['agency' => 'PADI', 'name' => 'Deep Diver', 'code' => 'DEEP', 'minimum_age' => 15, 'prerequisite_code' => 'AOWD', 'sort_order' => 21],
            ['agency' => 'PADI', 'name' => 'Wreck Diver', 'code' => 'WRECK', 'minimum_age' => 15, 'prerequisite_code' => 'AOWD', 'sort_order' => 22],
            ['agency' => 'PADI', 'name' => 'Night Diver', 'code' => 'NIGHT', 'minimum_age' => 12, 'prerequisite_code' => 'OWD', 'sort_order' => 23],
            ['agency' => 'PADI', 'name' => 'Underwater Navigator', 'code' => 'NAV', 'minimum_age' => 10, 'prerequisite_code' => 'OWD', 'sort_order' => 24],

            // SSI Certifications
            ['agency' => 'SSI', 'name' => 'Scuba Diver', 'code' => 'SD', 'minimum_age' => 10, 'sort_order' => 1],
            ['agency' => 'SSI', 'name' => 'Open Water Diver', 'code' => 'OWD', 'minimum_age' => 10, 'sort_order' => 2],
            ['agency' => 'SSI', 'name' => 'Advanced Adventurer', 'code' => 'AA', 'minimum_age' => 12, 'prerequisite_code' => 'OWD', 'sort_order' => 3],
            ['agency' => 'SSI', 'name' => 'Diver Stress & Rescue', 'code' => 'DSR', 'minimum_age' => 12, 'prerequisite_code' => 'AA', 'sort_order' => 4],
            ['agency' => 'SSI', 'name' => 'Master Diver', 'code' => 'MD', 'minimum_age' => 15, 'minimum_dives' => 50, 'sort_order' => 5],
            ['agency' => 'SSI', 'name' => 'Dive Guide', 'code' => 'DG', 'minimum_age' => 18, 'minimum_dives' => 40, 'is_instructor_level' => true, 'sort_order' => 10],
            ['agency' => 'SSI', 'name' => 'Divemaster', 'code' => 'DM', 'minimum_age' => 18, 'is_instructor_level' => true, 'sort_order' => 11],
            ['agency' => 'SSI', 'name' => 'Open Water Instructor', 'code' => 'OWI', 'minimum_age' => 18, 'is_instructor_level' => true, 'sort_order' => 12],

            // NAUI Certifications
            ['agency' => 'NAUI', 'name' => 'Scuba Diver', 'code' => 'SD', 'minimum_age' => 10, 'sort_order' => 1],
            ['agency' => 'NAUI', 'name' => 'Open Water Diver', 'code' => 'OWD', 'minimum_age' => 10, 'sort_order' => 2],
            ['agency' => 'NAUI', 'name' => 'Advanced Scuba Diver', 'code' => 'ASD', 'minimum_age' => 15, 'prerequisite_code' => 'OWD', 'sort_order' => 3],
            ['agency' => 'NAUI', 'name' => 'Rescue Scuba Diver', 'code' => 'RSD', 'minimum_age' => 15, 'prerequisite_code' => 'ASD', 'sort_order' => 4],
            ['agency' => 'NAUI', 'name' => 'Master Scuba Diver', 'code' => 'MSD', 'minimum_age' => 18, 'minimum_dives' => 50, 'sort_order' => 5],
            ['agency' => 'NAUI', 'name' => 'Divemaster', 'code' => 'DM', 'minimum_age' => 18, 'is_instructor_level' => true, 'sort_order' => 10],
            ['agency' => 'NAUI', 'name' => 'Instructor', 'code' => 'INST', 'minimum_age' => 18, 'is_instructor_level' => true, 'sort_order' => 11],

            // BSAC Certifications
            ['agency' => 'BSAC', 'name' => 'Ocean Diver', 'code' => 'OD', 'minimum_age' => 12, 'sort_order' => 1],
            ['agency' => 'BSAC', 'name' => 'Sports Diver', 'code' => 'SD', 'minimum_age' => 14, 'sort_order' => 2],
            ['agency' => 'BSAC', 'name' => 'Dive Leader', 'code' => 'DL', 'minimum_age' => 16, 'sort_order' => 3],
            ['agency' => 'BSAC', 'name' => 'Advanced Diver', 'code' => 'AD', 'minimum_age' => 16, 'sort_order' => 4],
            ['agency' => 'BSAC', 'name' => 'First Class Diver', 'code' => 'FCD', 'minimum_age' => 18, 'sort_order' => 5],
        ];

        foreach ($certifications as $cert) {
            CertificationType::updateOrCreate(
                ['agency' => $cert['agency'], 'code' => $cert['code']],
                array_merge($cert, ['is_active' => true])
            );
        }

        $this->command->info('Certification types seeded successfully!');
    }
}
