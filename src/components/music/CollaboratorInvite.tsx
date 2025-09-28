import React, { useState } from 'react';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'artist' | 'producer' | 'songwriter' | 'mixer' | 'engineer' | 'featured_artist' | 'other';
  avatar?: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedAt: string;
  permissions: {
    canEdit: boolean;
    canView: boolean;
    canComment: boolean;
    canApprove: boolean;
  };
}

interface Project {
  id: string;
  title: string;
  type: 'release' | 'track' | 'album';
  status: 'draft' | 'in_progress' | 'review' | 'completed';
}

interface CollaboratorInviteProps {
  project: Project;
  existingCollaborators: Collaborator[];
  onInviteCollaborator: (email: string, role: Collaborator['role'], permissions: Collaborator['permissions']) => void;
  onUpdateCollaborator: (collaboratorId: string, updates: Partial<Collaborator>) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
  onResendInvite: (collaboratorId: string) => void;
  suggestedCollaborators?: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    recentProjects: string[];
  }>;
}

const CollaboratorInvite: React.FC<CollaboratorInviteProps> = ({
  project,
  existingCollaborators,
  onInviteCollaborator,
  onUpdateCollaborator,
  onRemoveCollaborator,
  onResendInvite,
  suggestedCollaborators = []
}) => {
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Collaborator['role']>('artist');
  const [invitePermissions, setInvitePermissions] = useState<Collaborator['permissions']>({
    canEdit: false,
    canView: true,
    canComment: true,
    canApprove: false
  });
  const [searchTerm, setSearchTerm] = useState('');

  const roleOptions = [
    { value: 'artist', label: 'Artist', icon: '🎤' },
    { value: 'producer', label: 'Producer', icon: '🎛️' },
    { value: 'songwriter', label: 'Songwriter', icon: '✍️' },
    { value: 'mixer', label: 'Mixer', icon: '🎚️' },
    { value: 'engineer', label: 'Engineer', icon: '⚙️' },
    { value: 'featured_artist', label: 'Featured Artist', icon: '⭐' },
    { value: 'other', label: 'Other', icon: '👤' }
  ];

  const getRoleIcon = (role: Collaborator['role']) => {
    const option = roleOptions.find(opt => opt.value === role);
    return option?.icon || '👤';
  };

  const getRoleLabel = (role: Collaborator['role']) => {
    const option = roleOptions.find(opt => opt.value === role);
    return option?.label || 'Other';
  };

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'declined': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Collaborator['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'accepted': return '✅';
      case 'declined': return '❌';
      default: return '❓';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteCollaborator(inviteEmail.trim(), inviteRole, invitePermissions);
      setInviteEmail('');
      setInviteRole('artist');
      setInvitePermissions({
        canEdit: false,
        canView: true,
        canComment: true,
        canApprove: false
      });
      setShowInviteForm(false);
    }
  };

  const handleQuickInvite = (suggested: typeof suggestedCollaborators[0]) => {
    onInviteCollaborator(suggested.email, 'artist', {
      canEdit: false,
      canView: true,
      canComment: true,
      canApprove: false
    });
  };

  const updatePermission = (collaboratorId: string, permission: keyof Collaborator['permissions'], value: boolean) => {
    const collaborator = existingCollaborators.find(c => c.id === collaboratorId);
    if (collaborator) {
      onUpdateCollaborator(collaboratorId, {
        permissions: {
          ...collaborator.permissions,
          [permission]: value
        }
      });
    }
  };

  const filteredSuggestions = suggestedCollaborators.filter(suggestion =>
    !existingCollaborators.some(collab => collab.email === suggestion.email) &&
    (suggestion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     suggestion.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Collaborators</h2>
            <p className="text-purple-100">
              {project.title} • {project.type.charAt(0).toUpperCase() + project.type.slice(1)}
            </p>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="bg-white text-purple-600 hover:bg-purple-50 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Invite Collaborator
          </button>
        </div>

        {/* Project Status */}
        <div className="flex items-center space-x-4 text-sm">
          <span className={`px-3 py-1 rounded-full border ${
            project.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
            project.status === 'review' ? 'bg-blue-100 text-blue-800 border-blue-200' :
            project.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.replace('_', ' ').slice(1)}
          </span>
          <span>{existingCollaborators.length} collaborator{existingCollaborators.length !== 1 ? 's' : ''}</span>
          <span>{existingCollaborators.filter(c => c.status === 'accepted').length} active</span>
        </div>
      </div>

      {/* Invite Form Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Collaborator</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="collaborator@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Collaborator['role'])}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="space-y-2">
                    {[
                      { key: 'canView', label: 'Can view project' },
                      { key: 'canComment', label: 'Can leave comments' },
                      { key: 'canEdit', label: 'Can edit project' },
                      { key: 'canApprove', label: 'Can approve changes' }
                    ].map(permission => (
                      <label key={permission.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={invitePermissions[permission.key as keyof Collaborator['permissions']]}
                          onChange={(e) => setInvitePermissions(prev => ({
                            ...prev,
                            [permission.key]: e.target.checked
                          }))}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Suggested Collaborators */}
        {suggestedCollaborators.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Suggested Collaborators</h3>
              <input
                type="text"
                placeholder="Search suggestions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSuggestions.slice(0, 4).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      {suggestion.avatar ? (
                        <img
                          src={suggestion.avatar}
                          alt={suggestion.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                          👤
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                        <p className="text-sm text-gray-600">{suggestion.email}</p>
                        {suggestion.recentProjects.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Recent: {suggestion.recentProjects.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleQuickInvite(suggestion)}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                    >
                      Quick Invite
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Collaborators */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Collaborators ({existingCollaborators.length})
          </h3>

          {existingCollaborators.length > 0 ? (
            <div className="space-y-4">
              {existingCollaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg">
                          {getRoleIcon(collaborator.role)}
                        </div>
                      )}

                      <div className="flex-1">
                        {/* Basic Info */}
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{collaborator.name}</h4>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(collaborator.status)}`}>
                            {getStatusIcon(collaborator.status)} {collaborator.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{collaborator.email}</span>
                          <span>{getRoleIcon(collaborator.role)} {getRoleLabel(collaborator.role)}</span>
                          <span>Invited {formatDate(collaborator.invitedAt)}</span>
                        </div>

                        {/* Permissions */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { key: 'canView', label: 'View' },
                            { key: 'canComment', label: 'Comment' },
                            { key: 'canEdit', label: 'Edit' },
                            { key: 'canApprove', label: 'Approve' }
                          ].map(permission => (
                            <label key={permission.key} className="flex items-center text-sm">
                              <input
                                type="checkbox"
                                checked={collaborator.permissions[permission.key as keyof Collaborator['permissions']]}
                                onChange={(e) => updatePermission(collaborator.id, permission.key as keyof Collaborator['permissions'], e.target.checked)}
                                disabled={collaborator.status !== 'accepted'}
                                className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                              />
                              <span className="ml-1 text-gray-700">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {collaborator.status === 'pending' && (
                        <button
                          onClick={() => onResendInvite(collaborator.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                        >
                          Resend
                        </button>
                      )}

                      <button
                        onClick={() => onRemoveCollaborator(collaborator.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium py-1 px-3 rounded-md transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Collaborators Yet</h3>
              <p className="text-gray-600 mb-4">
                Invite collaborators to work together on this {project.type}.
              </p>
              <button
                onClick={() => setShowInviteForm(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Invite First Collaborator
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Collaborators can be managed at any time during the project.
          </div>
          <div className="flex items-center space-x-4">
            <span>{existingCollaborators.filter(c => c.status === 'pending').length} pending invites</span>
            <span>{existingCollaborators.filter(c => c.status === 'accepted').length} active collaborators</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorInvite;
