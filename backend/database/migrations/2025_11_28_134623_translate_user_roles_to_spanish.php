<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $translations = [
            'platform_admin' => 'Administrador de Plataforma',
            'entity_admin' => 'Administrador del Ente',
            'entity_staff' => 'Personal del Ente',
            'organizer_admin' => 'Organizador de Eventos',
        ];

        foreach ($translations as $roleCode => $roleName) {
            DB::table('user_roles')
                ->where('role_code', $roleCode)
                ->update(['role_name' => $roleName]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $translations = [
            'platform_admin' => 'Platform Administrator',
            'entity_admin' => 'Entity Administrator',
            'entity_staff' => 'Entity Staff',
            'organizer_admin' => 'Event Organizer',
        ];

        foreach ($translations as $roleCode => $roleName) {
            DB::table('user_roles')
                ->where('role_code', $roleCode)
                ->update(['role_name' => $roleName]);
        }
    }
};
