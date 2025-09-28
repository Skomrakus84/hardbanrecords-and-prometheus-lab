import React, { useState, useRef, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore';

interface FileUploadProps {
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  multiple?: boolean;
  onUploadSuccess?: (files: UploadedFile[]) => void;
  onUploadError?: (error: string) => void;
  uploadType?: 'music' | 'publishing' | 'general';
  className?: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

interface UploadProgress {
  file: globalThis.File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  uploadedFile?: UploadedFile;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  acceptedTypes = ['audio/*', 'image/*', 'application/pdf', '.txt', '.doc', '.docx'],
  maxSize = 100, // 100MB default
  multiple = false,
  onUploadSuccess,
  onUploadError,
  uploadType = 'general',
  className = ''
}) => {
  const { user, token } = useAuthStore();
  const fileInputRef = useRef<globalThis.HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  const validateFile = (file: globalThis.File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    // Check file type if specified
    if (acceptedTypes.length > 0) {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type.toLowerCase());
        }
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(baseType);
        }
        return fileType === type;
      });

      if (!isAccepted) {
        return `File type not accepted. Allowed types: ${acceptedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const uploadFile = async (file: globalThis.File): Promise<UploadedFile> => {
    const formData = new globalThis.FormData();
    formData.append('file', file);
    formData.append('type', uploadType);

    const response = await globalThis.fetch('/api/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return await response.json();
  };

  const handleFiles = useCallback(async (files: globalThis.FileList) => {
    const fileArray = Array.from(files);
    const validFiles: globalThis.File[] = [];
    const errors: string[] = [];

    // Validate all files first
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onUploadError?.(errors.join('\n'));
      return;
    }

    if (!multiple && validFiles.length > 1) {
      onUploadError?.('Only one file can be uploaded at a time');
      return;
    }

    // Initialize upload progress for all files
    const newUploads: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Upload files
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const uploadedFile = await uploadFile(file);
        
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, progress: 100, status: 'completed', uploadedFile }
              : upload
          )
        );

        return uploadedFile;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploads(prev => 
          prev.map(upload => 
            upload.file === file 
              ? { ...upload, status: 'error', error: errorMessage }
              : upload
          )
        );

        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      onUploadSuccess?.(results);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'One or more uploads failed';
      onUploadError?.(errorMessage);
    }
  }, [maxSize, acceptedTypes, multiple, uploadType, user, onUploadSuccess, onUploadError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<globalThis.HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeUpload = (file: globalThis.File) => {
    setUploads(prev => prev.filter(upload => upload.file !== file));
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => upload.status !== 'completed'));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: globalThis.File): string => {
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎬';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('document') || file.type.includes('doc')) return '📝';
    if (file.type.includes('text')) return '📄';
    return '📁';
  };

  return (
    <div className={`file-upload ${className}`}>
      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            {multiple ? 'Select multiple files' : 'Select a file'} to upload
          </p>
          <p className="text-xs text-gray-400">
            Max size: {maxSize}MB | Accepted: {acceptedTypes.join(', ')}
          </p>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">
              Uploads ({uploads.length})
            </h4>
            {uploads.some(u => u.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear completed
              </button>
            )}
          </div>
          
          <div className="space-y-3">
            {uploads.map((upload, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{getFileIcon(upload.file)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{upload.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(upload.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {upload.status === 'completed' && (
                      <span className="text-green-600">✓</span>
                    )}
                    {upload.status === 'error' && (
                      <span className="text-red-600">✗</span>
                    )}
                    <button
                      onClick={() => removeUpload(upload.file)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {upload.status === 'uploading' && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {upload.status === 'error' && upload.error && (
                  <p className="text-sm text-red-600 mt-2">{upload.error}</p>
                )}

                {/* Success Info */}
                {upload.status === 'completed' && upload.uploadedFile && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">Upload completed successfully</p>
                    <p className="text-xs text-gray-500">
                      File ID: {upload.uploadedFile.id}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
