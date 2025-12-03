<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // 1. Hacer NOT NULL los campos de type/subtype
            // NOTA: Solo posible si TODOS los eventos tienen estos campos poblados
            $table->foreignId('event_type_id')->nullable(false)->change();
            $table->foreignId('event_subtype_id')->nullable(false)->change();

            // 2. Remover foreign key y columna category_id
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });

        // 3. Eliminar tabla categories (cascada ya eliminada)
        Schema::dropIfExists('categories');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recrear tabla categories
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('entity_id')->constrained('organizations');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Re-agregar category_id a events
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained('categories');

            // Hacer nullable los campos de type/subtype
            $table->foreignId('event_type_id')->nullable()->change();
            $table->foreignId('event_subtype_id')->nullable()->change();
        });
    }
};
