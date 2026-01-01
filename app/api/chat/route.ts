import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context } = body;

    const apiKey = process.env.ZENMUX_API_KEY;
    const baseUrl = process.env.ZENMUX_BASE_URL;
    const model = process.env.ZENMUX_MODEL;

    if (!apiKey || !baseUrl || !model) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 }
      );
    }

    // Build system prompt with RAG context
    const systemPrompt = buildSystemPrompt(context);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ZenMux API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to get response from AI' },
        { status: response.status }
      );
    }

    // Return streaming response
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(context: { files: Array<{ name: string; content: string }> } | null): string {
  const basePrompt = `You are ARC, an intelligent AI assistant with access to documents that the user has provided. You should reference these documents when relevant to answer the user's questions.

IMPORTANT - OUTPUT FORMATTING RULES:
- Always use proper, well-formed Markdown syntax
- For bold text, ensure you close tags properly: **bold text**
- For numbered lists, use consistent formatting with line breaks:
  1. First item
  2. Second item
  3. Third item
- For bullet lists, use proper formatting:
  - Item one
  - Item two
- For headings, use: ## Heading or ### Subheading
- For tables, use proper markdown table syntax:
  | Column 1 | Column 2 |
  |----------|----------|
  | Data 1   | Data 2   |
- Never leave markdown syntax unclosed (no dangling ** or __)
- Add blank lines between sections for readability
- When listing document contents, format them as clean hierarchical lists

Your personality:
- Helpful and friendly
- Concise but thorough
- When a user adds a new file, acknowledge it naturally (e.g., "I see you've added [filename]. I can now help you with its contents.")
- Always reference specific parts of documents when answering questions about them`;

  if (!context || !context.files || context.files.length === 0) {
    return `${basePrompt}

Note: No documents have been uploaded yet. You can ask the user to upload documents for you to analyze.`;
  }

  let contextSection = '\n\n=== DOCUMENT CONTEXT ===\n';

  for (const file of context.files) {
    contextSection += `\n[FILE: ${file.name}]\n`;
    contextSection += '```\n';
    contextSection += file.content.slice(0, 10000); // Limit content per file
    if (file.content.length > 10000) {
      contextSection += '\n... (content truncated)';
    }
    contextSection += '\n```\n';
  }

  contextSection += '\n=== END CONTEXT ===';

  return basePrompt + contextSection;
}
