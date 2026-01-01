'use client';

import { useCallback, useEffect, useRef } from 'react';
import DocumentPanel from '@/components/DocumentPanel';
import ChatPanel from '@/components/ChatPanel';
import LoginPage from '@/components/LoginPage';
import { useFileManager, FileItem } from '@/hooks/useFileManager';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();

  const {
    files,
    isProcessing,
    addFiles,
    removeFile,
    getContext,
  } = useFileManager();

  const {
    messages,
    isLoading,
    sendMessage,
    acknowledgeNewFiles,
    stopGeneration,
  } = useChat();

  // Keep track of previous files to detect new additions
  const prevFilesRef = useRef<FileItem[]>([]);

  // Handle file upload with auto-acknowledgment
  const handleFilesAdded = useCallback(async (fileList: FileList) => {
    const addedFiles = await addFiles(fileList);

    // If new files were added, acknowledge them
    if (addedFiles.length > 0) {
      const fileNames = addedFiles.map(f => f.name);
      // Get latest context including new files
      const context = {
        files: [...files, ...addedFiles].map(f => ({
          name: f.name,
          content: f.content,
        })),
      };
      await acknowledgeNewFiles(fileNames, context);
    }
  }, [addFiles, files, acknowledgeNewFiles]);

  // Handle sending messages with current context
  const handleSendMessage = useCallback((message: string) => {
    const context = getContext();
    sendMessage(message, context);
  }, [getContext, sendMessage]);

  // Update previous files ref
  useEffect(() => {
    prevFilesRef.current = files;
  }, [files]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner large" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <main className="app-container">
      <DocumentPanel
        files={files}
        isProcessing={isProcessing}
        onFilesAdded={handleFilesAdded}
        onFileRemove={removeFile}
      />
      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        fileCount={files.length}
        onSendMessage={handleSendMessage}
        onStopGeneration={stopGeneration}
        user={user}
        onLogout={logout}
      />
    </main>
  );
}
