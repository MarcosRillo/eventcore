/**
 * Categories Page
 * Main admin page for category management with full CRUD operations
 * This page is "dumb" - it only renders data from the useCategoryManager hook
 */

'use client';

import { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { TagIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { CategoryTableContainer, CreateCategoryModal, EditCategoryModal, useCategoryManager } from '@/features/categories';
import { Button, Input, LoadingSpinner, Select } from '@/components/ui';
import { Category, CategoryFilterStatus } from '@/types/category.types';

const CategoriesPage: React.FC = () => {
  // Use the bulletproof custom hook - all values are guaranteed to be safe
  const {
    categories,
    pagination,
    isLoading,
    error,
    searchTerm,
    filterStatus,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleDeleteCategory,
    refreshData,
    stats,
  } = useCategoryManager();
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // Handle category creation success
  const handleCreateSuccess = (): void => {
    refreshData();
  };

  // Handle category edit
  const handleEditCategory = (category: Category): void => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  // Handle edit success
  const handleEditSuccess = (): void => {
    refreshData();
    setSelectedCategory(null);
  };

  // Handle modal close
  const handleCloseModals = (): void => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCategory(null);
  };

  // Show loading spinner while data is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Cargando categorías..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Gestión de Categorías</h1>
              <p className="mt-2 text-neutral-600">
                Organiza y administra las categorías para tus eventos
              </p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<PlusIcon className="w-5 h-5" />}
            >
              Nueva Categoría
            </Button>
          </div>

          {/* Statistics Cards - Using safe stats from hook */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <TagIcon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Activas</p>
                  <p className="text-2xl font-bold text-success-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-success-100 rounded-full">
                  <CheckCircleIcon className="w-6 h-6 text-success-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Inactivas</p>
                  <p className="text-2xl font-bold text-error-600">{stats.inactive}</p>
                </div>
                <div className="p-3 bg-error-100 rounded-full">
                  <XCircleIcon className="w-6 h-6 text-error-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                label="Buscar categorías"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                fullWidth
              />
            </div>
            
            <div className="sm:w-48">
              <Select
                label="Estado"
                value={filterStatus}
                onChange={(value) => handleFilterChange(value as CategoryFilterStatus)}
                options={[
                  { value: 'all', label: 'Todas' },
                  { value: 'active', label: 'Solo activas' },
                  { value: 'inactive', label: 'Solo inactivas' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-error-50 border border-error-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-error-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-error-800 mb-1">Error en la operación</h3>
                <p className="text-sm text-error-600">{error}</p>
              </div>
              <Button
                onClick={refreshData}
                variant="ghost"
                size="sm"
                className="ml-3 text-error-400 hover:text-error-600"
                title="Cerrar mensaje de error"
              >
                <XMarkIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Categories Table - Only render if not loading and categories exist */}
        {!isLoading && (
          <CategoryTableContainer
            categories={categories} // Hook guarantees this is always an array
            pagination={pagination}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onPageChange={handlePageChange}
            loading={false} // We already handle loading above
          />
        )}

        {/* Empty State - Show when not loading and no categories */}
        {!isLoading && categories.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TagIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No hay categorías</h3>
            <p className="text-neutral-500 mb-6">Crea tu primera categoría para comenzar a organizar tus eventos</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Crear Primera Categoría
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateCategoryModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleCreateSuccess}
          onCategoryCreated={refreshData}
        />

        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
          category={selectedCategory}
          onCategoryUpdated={refreshData}
        />
      </div>
    </div>
  );
};

export default CategoriesPage;
