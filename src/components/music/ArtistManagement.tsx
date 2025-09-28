import React, { useState, useEffect } from 'react';
import { useArtistStore } from '../../store/artistStore';
import { Artist, Contract, CreateArtistDto, UpdateArtistDto } from '../../types/artist';
import { ArtistsList } from './ArtistsList';
import { ArtistProfile } from './ArtistProfile';
import { ArtistForm } from './ArtistForm';
import { ContractModal } from './ContractModal';

type ViewMode = 'list' | 'profile';

export const ArtistManagement: React.FC = () => {
  const {
    artists,
    isLoading,
    error,
    fetchArtists,
    addArtist,
    updateArtist,
    deleteArtist,
    addContract,
    updateContract,
    clearError,
    addToast
  } = useArtistStore();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  useEffect(() => {
    if (error) {
      addToast(error, 'error').catch(console.error);
      clearError();
    }
  }, [error, addToast, clearError]);

  // Artist CRUD handlers
  const handleViewArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setViewMode('profile');
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setShowArtistForm(true);
  };

  const handleDeleteArtist = async (artistId: string) => {
    if (window.confirm('Are you sure you want to delete this artist? This action cannot be undone.')) {
      try {
        await deleteArtist(artistId);
        await addToast('Artist deleted successfully', 'success');

        // If we're viewing the deleted artist, go back to list
        if (selectedArtist?.id === artistId) {
          setSelectedArtist(null);
          setViewMode('list');
        }
      } catch (error) {
        console.error('Error deleting artist:', error);
        await addToast('Failed to delete artist', 'error');
      }
    }
  };

  const handleSaveArtist = async (artistData: CreateArtistDto | UpdateArtistDto) => {
    try {
      if (editingArtist) {
        const updatedArtist = await updateArtist(editingArtist.id, artistData as UpdateArtistDto);
        await addToast('Artist updated successfully', 'success');

        // Update selected artist if it's the one being edited
        if (selectedArtist?.id === editingArtist.id) {
          setSelectedArtist(updatedArtist);
        }
      } else {
        await addArtist(artistData as CreateArtistDto);
        await addToast('Artist added successfully', 'success');
      }

      setShowArtistForm(false);
      setEditingArtist(null);
    } catch (error) {
      console.error('Error saving artist:', error);
      await addToast(`Failed to ${editingArtist ? 'update' : 'add'} artist`, 'error');
    }
  };

  // Contract handlers
  const handleAddContract = () => {
    setEditingContract(null);
    setShowContractModal(true);
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
    setShowContractModal(true);
  };

  const handleSaveContract = async (contractData: Omit<Contract, 'id' | 'artistId'>) => {
    if (!selectedArtist) return;

    try {
      if (editingContract) {
        await updateContract(selectedArtist.id, editingContract.id, { ...contractData, artistId: selectedArtist.id });
        await addToast('Contract updated successfully', 'success');
      } else {
        await addContract(selectedArtist.id, { ...contractData, artistId: selectedArtist.id });
        await addToast('Contract added successfully', 'success');
      }

      // Refresh selected artist data
      const updatedArtist = artists.find(a => a.id === selectedArtist.id);
      if (updatedArtist) {
        setSelectedArtist(updatedArtist);
      }

      setShowContractModal(false);
      setEditingContract(null);
    } catch (error) {
      console.error('Error saving contract:', error);
      await addToast(`Failed to ${editingContract ? 'update' : 'add'} contract`, 'error');
    }
  };

  // Navigation handlers
  const handleBackToList = () => {
    setSelectedArtist(null);
    setViewMode('list');
  };

  const handleAddNewArtist = () => {
    setEditingArtist(null);
    setShowArtistForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Artist Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your artists, contracts, and relationships
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex space-x-3">
            {viewMode === 'profile' && (
              <button
                onClick={handleBackToList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ← Back to List
              </button>
            )}

            <button
              onClick={handleAddNewArtist}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="mr-2">+</span>
              Add Artist
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{artists.length}</div>
            <div className="text-sm text-blue-600">Total Artists</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {artists.filter(a => a.status === 'active').length}
            </div>
            <div className="text-sm text-green-600">Active Artists</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {artists.reduce((total, artist) => total + artist.contracts.length, 0)}
            </div>
            <div className="text-sm text-yellow-600">Total Contracts</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'list' ? (
        <ArtistsList
          artists={artists}
          isLoading={isLoading}
          onView={handleViewArtist}
          onEdit={handleEditArtist}
          onDelete={handleDeleteArtist}
        />
      ) : selectedArtist ? (
        <ArtistProfile
          artist={selectedArtist}
          onEdit={handleEditArtist}
          onEditContract={handleEditContract}
          onAddContract={handleAddContract}
          onBack={handleBackToList}
        />
      ) : null}

      {/* Modals */}
      {showArtistForm && (
        <ArtistForm
          isOpen={showArtistForm}
          onClose={() => {
            setShowArtistForm(false);
            setEditingArtist(null);
          }}
          onSubmit={handleSaveArtist}
          artist={editingArtist}
        />
      )}

      {showContractModal && selectedArtist && (
        <ContractModal
          isOpen={showContractModal}
          onClose={() => {
            setShowContractModal(false);
            setEditingContract(null);
          }}
          onSave={handleSaveContract}
          contract={editingContract}
          artistName={selectedArtist.name}
        />
      )}
    </div>
  );
};
