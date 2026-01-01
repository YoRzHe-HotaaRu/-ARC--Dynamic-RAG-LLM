'use client';

import { useCallback, useState, useRef } from 'react';
import { Upload, FileText, FileJson, FileCode, File, X } from 'lucide-react';
import { FileItem, getFileExtension, formatFileSize } from '@/hooks/useFileManager';

interface DocumentPanelProps {
    files: FileItem[];
    isProcessing: boolean;
    onFilesAdded: (files: FileList) => Promise<void>;
    onFileRemove: (id: string) => void;
}

export default function DocumentPanel({
    files,
    isProcessing,
    onFilesAdded,
    onFileRemove,
}: DocumentPanelProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (e.dataTransfer.files.length > 0) {
            await onFilesAdded(e.dataTransfer.files);
        }
    }, [onFilesAdded]);

    const handleClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileInputChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await onFilesAdded(e.target.files);
            e.target.value = '';
        }
    }, [onFilesAdded]);

    return (
        <div className="document-panel">
            <div className="flex items-center justify-between mb-2">
                <h2 className="flex items-center gap-2">
                    <FileText size={20} className="text-[var(--accent-lavender)]" />
                    Documents
                </h2>
                {files.length > 0 && (
                    <span className="text-xs text-[var(--text-muted)]">
                        {files.length} file{files.length !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                    accept=".txt,.md,.json,.csv,.xml,.html,.css,.js,.ts,.jsx,.tsx,.py,.java,.go,.rs,.c,.cpp,.h,.sql,.yaml,.yml,.sh,.docx,.doc"
                />
                <Upload className="drop-zone-icon" />
                <p className="drop-zone-text">
                    <strong>Drop files</strong> here or click to browse
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">
                    Supports Word docs, text, code, JSON & more
                </p>
            </div>

            {/* File List */}
            <div className="file-list">
                {files.length === 0 ? (
                    <div className="empty-state">
                        <File className="empty-state-icon" />
                        <p className="text-sm">No documents yet</p>
                        <p className="text-xs mt-1">Upload files for the AI to analyze</p>
                    </div>
                ) : (
                    files.map((file) => (
                        <FileCard
                            key={file.id}
                            file={file}
                            onRemove={() => onFileRemove(file.id)}
                        />
                    ))
                )}
            </div>

            {isProcessing && (
                <div className="text-center text-sm text-[var(--text-muted)] py-2">
                    Processing...
                </div>
            )}
        </div>
    );
}

interface FileCardProps {
    file: FileItem;
    onRemove: () => void;
}

function FileCard({ file, onRemove }: FileCardProps) {
    const ext = getFileExtension(file.name);

    const getFileIcon = () => {
        const iconProps = { size: 18 };

        switch (ext) {
            case 'json':
                return <FileJson {...iconProps} />;
            case 'js':
            case 'ts':
            case 'jsx':
            case 'tsx':
            case 'py':
            case 'java':
            case 'go':
            case 'rs':
            case 'c':
            case 'cpp':
                return <FileCode {...iconProps} />;
            default:
                return <FileText {...iconProps} />;
        }
    };

    const getIconClass = () => {
        switch (ext) {
            case 'json':
                return 'json';
            case 'md':
                return 'md';
            case 'js':
            case 'ts':
            case 'jsx':
            case 'tsx':
            case 'py':
            case 'java':
            case 'go':
            case 'rs':
                return 'code';
            case 'pdf':
                return 'pdf';
            case 'docx':
            case 'doc':
                return 'md'; // Use markdown style for docs
            default:
                return 'txt';
        }
    };

    return (
        <div className="file-card">
            <div className={`file-icon ${getIconClass()}`}>
                {getFileIcon()}
            </div>
            <div className="file-info">
                <div className="file-name" title={file.name}>
                    {file.name}
                </div>
                <div className="file-meta">
                    {formatFileSize(file.size)} • .{ext}
                </div>
            </div>
            <button
                className="file-remove"
                onClick={onRemove}
                title="Remove file"
            >
                <X size={16} />
            </button>
        </div>
    );
}
