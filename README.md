# 🔷 ARC - The Dynamic RAG Assistant

<p align="center">
  <img src="public/logo.png" alt="ARC Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Upload documents. Ask questions. Get intelligent answers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind">
  <img src="https://img.shields.io/badge/Tests-42%20Passing-green?style=flat-square" alt="Tests">
</p>


---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Document Upload** | Drag & drop support for `.txt`, `.md`, `.json`, `.docx`, code files, and more |
| 🤖 **AI-Powered Chat** | Real-time streaming responses with RAG (Retrieval-Augmented Generation) |
| 📝 **Markdown Rendering** | Tables, code blocks, lists, and formatted text |
| 🌙 **Dark Mode Ready** | Built-in light/dark theme with OKLCH colors |
| ✅ **Fully Tested** | 42 unit tests covering hooks and components |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dynamic-rag-llm.git
cd dynamic-rag-llm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Configuration

Create a `.env.local` file with your API credentials:

```env
ZENMUX_API_KEY=your_api_key_here
ZENMUX_BASE_URL=https://zenmux.ai/api/v1
ZENMUX_MODEL=xiaomi/mimo-v2-flash
```

> **Note:** This project uses the ZenMux API (OpenAI-compatible). You can substitute any OpenAI-compatible API.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
dynamic-rag-llm/
├── app/
│   ├── api/chat/route.ts    # API endpoint for LLM chat
│   ├── globals.css          # OKLCH theme & component styles
│   ├── layout.tsx           # Root layout with fonts
│   ├── page.tsx             # Main application page
│   └── icon.png             # Favicon
├── components/
│   ├── ChatPanel.tsx        # Chat interface with markdown rendering
│   └── DocumentPanel.tsx    # File upload & management
├── hooks/
│   ├── useChat.ts           # Chat state & streaming logic
│   └── useFileManager.ts    # File parsing & RAG context
├── __tests__/               # Jest test suites
└── public/
    └── logo.png             # App logo
```

---

## 🎨 Supported File Types

| Category | Extensions |
|----------|-----------|
| **Documents** | `.txt`, `.md`, `.docx`, `.doc` |
| **Data** | `.json`, `.csv`, `.xml`, `.yaml`, `.yml` |
| **Code** | `.js`, `.ts`, `.tsx`, `.jsx`, `.py`, `.java`, `.go`, `.rs`, `.c`, `.cpp` |
| **Web** | `.html`, `.css`, `.sql` |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=useChat
```

**Test Results:** 42/42 passing ✅

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4 with OKLCH colors
- **Markdown:** react-markdown + remark-gfm
- **Testing:** Jest + React Testing Library
- **Document Parsing:** mammoth (for .docx files)
- **Icons:** Lucide React

---

## 🔧 API Configuration

The app uses a proxy API route (`/api/chat`) to securely communicate with the LLM provider. The system prompt includes:

- RAG context injection from uploaded documents
- Markdown formatting instructions
- Personality guidelines

To use a different LLM provider, modify `app/api/chat/route.ts`.

---

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run test suite |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built by ClaRity Group
</p>
