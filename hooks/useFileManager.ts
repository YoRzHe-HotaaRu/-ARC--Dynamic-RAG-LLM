'use client';

import { useState, useCallback } from 'react';

export interface FileItem {
    id: string;
    name: string;
    size: number;
    type: string;
    content: string;
    addedAt: Date;
}

export function useFileManager() {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const parseFile = useCallback(async (file: File): Promise<string> => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        // Handle DOCX files with mammoth
        if (extension === 'docx') {
            try {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                return result.value;
            } catch (error) {
                console.error('Error parsing DOCX:', error);
                return `[Error extracting text from ${file.name}]`;
            }
        }

        // Handle other text-based files
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                const content = event.target?.result as string;
                resolve(content);
            };

            reader.onerror = () => {
                reject(new Error(`Failed to read file: ${file.name}`));
            };

            // Read as text for most file types
            reader.readAsText(file);
        });
    }, []);

    const addFile = useCallback(async (file: File): Promise<FileItem | null> => {
        setIsProcessing(true);

        try {
            // Check if file already exists
            const existingFile = files.find(f => f.name === file.name);
            if (existingFile) {
                setIsProcessing(false);
                return null;
            }

            const content = await parseFile(file);

            const newFile: FileItem = {
                id: crypto.randomUUID(),
                name: file.name,
                size: file.size,
                type: file.type || getFileTypeFromName(file.name),
                content,
                addedAt: new Date(),
            };

            setFiles(prev => [...prev, newFile]);
            setIsProcessing(false);
            return newFile;
        } catch (error) {
            console.error('Error adding file:', error);
            setIsProcessing(false);
            return null;
        }
    }, [files, parseFile]);

    const addFiles = useCallback(async (fileList: FileList | File[]): Promise<FileItem[]> => {
        const filesArray = Array.from(fileList);
        const addedFiles: FileItem[] = [];

        for (const file of filesArray) {
            const added = await addFile(file);
            if (added) {
                addedFiles.push(added);
            }
        }

        return addedFiles;
    }, [addFile]);

    const removeFile = useCallback((id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);

    const getContext = useCallback(() => {
        return {
            files: files.map(f => ({
                name: f.name,
                content: f.content,
            })),
        };
    }, [files]);

    return {
        files,
        isProcessing,
        addFile,
        addFiles,
        removeFile,
        clearFiles,
        getContext,
    };
}

function getFileTypeFromName(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
        txt: 'text/plain',
        md: 'text/markdown',
        json: 'application/json',
        csv: 'text/csv',
        xml: 'application/xml',
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        ts: 'text/typescript',
        jsx: 'text/jsx',
        tsx: 'text/tsx',
        py: 'text/x-python',
        java: 'text/x-java',
        go: 'text/x-go',
        rs: 'text/x-rust',
        c: 'text/x-c',
        cpp: 'text/x-cpp',
        h: 'text/x-c',
        sql: 'text/x-sql',
        yaml: 'text/yaml',
        yml: 'text/yaml',
        sh: 'text/x-sh',
        pdf: 'application/pdf',
    };
    return typeMap[ext] || 'text/plain';
}

export function getFileExtension(name: string): string {
    return name.split('.').pop()?.toLowerCase() || 'txt';
}

export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
