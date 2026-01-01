import { render, screen, fireEvent } from '@testing-library/react';
import DocumentPanel from '@/components/DocumentPanel';

// Mock the hooks
jest.mock('@/hooks/useFileManager', () => ({
    ...jest.requireActual('@/hooks/useFileManager'),
}));

describe('DocumentPanel', () => {
    const mockOnFilesAdded = jest.fn().mockResolvedValue(undefined);
    const mockOnFileRemove = jest.fn();

    const defaultProps = {
        files: [],
        isProcessing: false,
        onFilesAdded: mockOnFilesAdded,
        onFileRemove: mockOnFileRemove,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render the drop zone', () => {
            render(<DocumentPanel {...defaultProps} />);

            expect(screen.getByText(/Drop files/i)).toBeInTheDocument();
            expect(screen.getByText(/here or click to browse/i)).toBeInTheDocument();
        });

        it('should show empty state when no files', () => {
            render(<DocumentPanel {...defaultProps} />);

            expect(screen.getByText('No documents yet')).toBeInTheDocument();
        });

        it('should render file cards when files are provided', () => {
            const files = [
                { id: '1', name: 'test.txt', size: 1024, type: 'text/plain', content: 'Test', addedAt: new Date() },
                { id: '2', name: 'data.json', size: 2048, type: 'application/json', content: '{}', addedAt: new Date() },
            ];

            render(<DocumentPanel {...defaultProps} files={files} />);

            expect(screen.getByText('test.txt')).toBeInTheDocument();
            expect(screen.getByText('data.json')).toBeInTheDocument();
        });

        it('should show file count badge', () => {
            const files = [
                { id: '1', name: 'test.txt', size: 1024, type: 'text/plain', content: 'Test', addedAt: new Date() },
                { id: '2', name: 'test2.txt', size: 1024, type: 'text/plain', content: 'Test2', addedAt: new Date() },
            ];

            render(<DocumentPanel {...defaultProps} files={files} />);

            expect(screen.getByText('2 files')).toBeInTheDocument();
        });
    });

    describe('interactions', () => {
        it('should call onFileRemove when remove button is clicked', () => {
            const files = [
                { id: 'file-1', name: 'test.txt', size: 1024, type: 'text/plain', content: 'Test', addedAt: new Date() },
            ];

            render(<DocumentPanel {...defaultProps} files={files} />);

            const removeButton = screen.getByTitle('Remove file');
            fireEvent.click(removeButton);

            expect(mockOnFileRemove).toHaveBeenCalledWith('file-1');
        });

        it('should show processing state', () => {
            render(<DocumentPanel {...defaultProps} isProcessing={true} />);

            expect(screen.getByText('Processing...')).toBeInTheDocument();
        });
    });

    describe('drag and drop', () => {
        it('should add drag-over class on drag over', () => {
            render(<DocumentPanel {...defaultProps} />);

            const dropZone = screen.getByText(/Drop files/i).closest('.drop-zone');

            fireEvent.dragOver(dropZone!);

            expect(dropZone).toHaveClass('drag-over');
        });

        it('should remove drag-over class on drag leave', () => {
            render(<DocumentPanel {...defaultProps} />);

            const dropZone = screen.getByText(/Drop files/i).closest('.drop-zone');

            fireEvent.dragOver(dropZone!);
            fireEvent.dragLeave(dropZone!);

            expect(dropZone).not.toHaveClass('drag-over');
        });
    });
});
