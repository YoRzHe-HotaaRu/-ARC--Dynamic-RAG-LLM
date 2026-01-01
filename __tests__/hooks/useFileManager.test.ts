import { renderHook, act } from '@testing-library/react';
import { useFileManager, getFileExtension, formatFileSize } from '@/hooks/useFileManager';

describe('useFileManager', () => {
    describe('addFile', () => {
        it('should add a text file successfully', async () => {
            const { result } = renderHook(() => useFileManager());

            const mockFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });

            await act(async () => {
                const added = await result.current.addFile(mockFile);
                expect(added).not.toBeNull();
                expect(added?.name).toBe('test.txt');
                expect(added?.content).toBe('Hello World');
            });

            expect(result.current.files).toHaveLength(1);
            expect(result.current.files[0].name).toBe('test.txt');
        });

        it('should add multiple unique files via addFiles', async () => {
            const { result } = renderHook(() => useFileManager());

            const files = [
                new File(['Content 1'], 'file1.txt', { type: 'text/plain' }),
                new File(['Content 2'], 'file2.txt', { type: 'text/plain' }),
                new File(['Content 3'], 'file3.txt', { type: 'text/plain' }),
            ];

            await act(async () => {
                await result.current.addFiles(files);
            });

            expect(result.current.files).toHaveLength(3);
        });

        it('should assign unique IDs to files', async () => {
            const { result } = renderHook(() => useFileManager());

            await act(async () => {
                await result.current.addFile(new File(['A'], 'a.txt', { type: 'text/plain' }));
                await result.current.addFile(new File(['B'], 'b.txt', { type: 'text/plain' }));
            });

            expect(result.current.files[0].id).not.toBe(result.current.files[1].id);
        });
    });

    describe('removeFile', () => {
        it('should remove a file by id', async () => {
            const { result } = renderHook(() => useFileManager());

            const mockFile = new File(['Test'], 'remove-me.txt', { type: 'text/plain' });

            let fileId: string = '';
            await act(async () => {
                const added = await result.current.addFile(mockFile);
                fileId = added!.id;
            });

            expect(result.current.files).toHaveLength(1);

            act(() => {
                result.current.removeFile(fileId);
            });

            expect(result.current.files).toHaveLength(0);
        });

        it('should not affect other files when removing one', async () => {
            const { result } = renderHook(() => useFileManager());

            let fileIdToRemove: string = '';
            await act(async () => {
                const added1 = await result.current.addFile(new File(['1'], 'keep.txt', { type: 'text/plain' }));
                const added2 = await result.current.addFile(new File(['2'], 'remove.txt', { type: 'text/plain' }));
                fileIdToRemove = added2!.id;
            });

            act(() => {
                result.current.removeFile(fileIdToRemove);
            });

            expect(result.current.files).toHaveLength(1);
            expect(result.current.files[0].name).toBe('keep.txt');
        });
    });

    describe('clearFiles', () => {
        it('should clear all files', async () => {
            const { result } = renderHook(() => useFileManager());

            const files = [
                new File(['1'], 'a.txt', { type: 'text/plain' }),
                new File(['2'], 'b.txt', { type: 'text/plain' }),
            ];

            await act(async () => {
                await result.current.addFiles(files);
            });

            expect(result.current.files).toHaveLength(2);

            act(() => {
                result.current.clearFiles();
            });

            expect(result.current.files).toHaveLength(0);
        });
    });

    describe('getContext', () => {
        it('should return context with file names and contents', async () => {
            const { result } = renderHook(() => useFileManager());

            await act(async () => {
                await result.current.addFile(
                    new File(['Hello'], 'hello.txt', { type: 'text/plain' })
                );
                await result.current.addFile(
                    new File(['{"key": "value"}'], 'data.json', { type: 'application/json' })
                );
            });

            const context = result.current.getContext();

            expect(context.files).toHaveLength(2);
            expect(context.files[0].name).toBe('hello.txt');
            expect(context.files[0].content).toBe('Hello');
            expect(context.files[1].name).toBe('data.json');
            expect(context.files[1].content).toBe('{"key": "value"}');
        });

        it('should return empty context when no files', () => {
            const { result } = renderHook(() => useFileManager());
            const context = result.current.getContext();
            expect(context.files).toHaveLength(0);
        });
    });

    describe('isProcessing', () => {
        it('should be false initially', () => {
            const { result } = renderHook(() => useFileManager());
            expect(result.current.isProcessing).toBe(false);
        });
    });
});

describe('getFileExtension', () => {
    it('should extract file extension correctly', () => {
        expect(getFileExtension('test.txt')).toBe('txt');
        expect(getFileExtension('script.js')).toBe('js');
        expect(getFileExtension('data.json')).toBe('json');
        expect(getFileExtension('readme.md')).toBe('md');
        expect(getFileExtension('noextension')).toBe('noextension');
    });

    it('should handle files with multiple dots', () => {
        expect(getFileExtension('file.test.spec.ts')).toBe('ts');
        expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });
});

describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
        expect(formatFileSize(0)).toBe('0 B');
        expect(formatFileSize(500)).toBe('500 B');
        expect(formatFileSize(1024)).toBe('1.0 KB');
        expect(formatFileSize(1536)).toBe('1.5 KB');
        expect(formatFileSize(1048576)).toBe('1.0 MB');
        expect(formatFileSize(2621440)).toBe('2.5 MB');
    });
});
