import React from 'react';

// Mock react-markdown for Jest tests
const ReactMarkdown = ({ children }: { children: string }) => {
    return React.createElement('div', { 'data-testid': 'markdown-content' }, children);
};

export default ReactMarkdown;
