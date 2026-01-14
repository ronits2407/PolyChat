# PolyChat - AI-Powered Multi-Model Chat Platform

<div align="center">

**A cutting-edge conversational AI platform that intelligently routes user queries to the most suitable AI model while maintaining contextual conversation memory.**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=flat-square)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue?style=flat-square)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.3-brightgreen?style=flat-square)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow?style=flat-square)](LICENSE)

</div>

---

## 🌟 Key Features

### 🧠 Intelligent Multi-Model Routing

PolyChat leverages advanced semantic understanding to automatically select the best AI model for each user query:

- **Multiple AI Backends**: Seamlessly integrates with:

  - 🚀 **ChatGPT-4o** (OpenAI) - Advanced reasoning and code generation
  - 🎨 **Gemini 3.5 Pro** (Google) - Creative and analytical tasks
  - 🦙 **Gemma** (Ollama) - Fast, lightweight local inference
  - 🌊 **Mistral** (Ollama) - Efficient open-source model
  - 🔗 **Cohere** - Advanced NLP and semantic understanding

- **Smart Model Selection Methods**:
  - **Semantic Routing**: Uses vector embeddings to intelligently classify queries and route them to the most suitable model
  - **Manual Classification**: Keyword-based routing for quick decisions
  - **Gemma-Powered Selection**: AI-assisted model selection using Gemma's classification capabilities
  - **Auto-Detection**: Dynamically selects the optimal model based on user intent

### 💾 Contextual Conversation Memory

Every conversation is intelligently preserved and retrieved:

- **Full Conversation History**: All messages are stored with timestamps, roles (user/assistant), and which model responded
- **Persistent Storage**: MongoDB integration ensures conversations survive across sessions
- **Smart Summarization**: Automatic conversation summaries help maintain context without overwhelming the model
- **Message-Level Tracking**: Each message records which AI model generated the response, enabling transparency and quality tracking
- **Conversation Management**: Create, retrieve, and update conversations with full message context
- **Session Recovery**: Resume conversations seamlessly from where you left off

### 🔍 Advanced Semantic Embeddings

At the heart of PolyChat's intelligence is its embedding system:

- **Vector-Based Semantic Similarity**: Uses `mxbai-embed-large` model for generating high-quality embeddings
- **Angular Distance Calculation**: Measures semantic similarity between user messages and predefined phrase embeddings
- **Cosine Similarity Matching**: Finds the most contextually relevant model category
- **Pre-computed Embedding Phrases**: Maintains a comprehensive library of example phrases for each model, enabling zero-latency semantic routing
- **Dynamic Embedding Generation**: Supports OpenAI embeddings as an alternative backend

### 🎨 Beautiful, Responsive UI

Modern and intuitive interface optimized for all devices:

- **Clean Two-Panel Layout**:
  - **Left Panel**: Sleek navigation sidebar with sidebar-style gradient logo, new chat button, and recent conversation history
  - **Right Panel**: Large, expandable chat workspace with optimal readability
- **Responsive Design**:
  - Fully responsive layout that adapts from mobile (320px) to ultra-wide displays (4K+)
  - Flexible flexbox layout system for perfect alignment across all screen sizes
  - Touch-friendly interface for mobile and tablet users
- **Modern Visual Design**:
  - **Gradient Accents**: Modern linear gradients (#14275e to #3557bb) for visual depth
  - **Smooth Interactions**: Hover effects and transitions for enhanced user feedback
  - **Professional Color Palette**: Dark secondary colors (#333c4e) for excellent readability
  - **Icon Integration**: SVG icons from HeroIcons for a polished, professional appearance
  - **Typography**: Clean sans-serif font family for optimal legibility
  - **Spacing & Padding**: Consistent, generous spacing for visual breathing room
- **Multi-Screen Support**:
  - **Screen 1**: Main chat interface with conversation history
  - **Screen 2**: Supplementary features and additional functionality
  - Seamless navigation between different screens

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (optional - app can run with in-memory storage)
- **API Keys** for your chosen AI providers:
  - OpenAI API Key
  - Google Gemini API Key
  - Cohere API Key
- **Ollama** ( for local model inference like Gemma and Mistral)

## 📁 Project Structure

```
Polychat/
├── index.js                           # Main server entry point
├── package.json                       # Project dependencies
├── README.md                          # Original documentation
├── newReadme.md                       # This comprehensive guide
│
├── api/
│   ├── controller.js                  # Core chat logic & model routing
│   ├── model.js                       # MongoDB schema definitions
│   ├── route.js                       # API endpoint routes
│   ├── keywords.js                    # Keyword mapping for models
│   ├── generateEmbedding.js           # Embedding generation script
│   ├── generateEmbedding-openai.js    # OpenAI embedding alternative
│   ├── embeddingPhrases.json          # Pre-computed embeddings
│   └── embeddingPhrases-openai.json   # OpenAI embeddings backup
│
└── public/
    ├── index.html                     # Main chat interface
    ├── screen1.css                    # Primary styling
    ├── screen1.js                     # Main chat functionality
    ├── screen2.html                   # Secondary interface
    ├── screen2.css                    # Secondary styling
    └── screen2.js                     # Secondary functionality
```

---

## 🔧 API Endpoints

### Chat Operations

#### Send a Chat Message

```http
POST /api/chat
Content-Type: application/json

{
  "message": "Your question here",
  "conversationId": "optional_conversation_id"
}
```

**Response:**

```json
{
  "response": "AI model's response",
  "model": "chatgpt|gemini|gemma|cohere|mistral",
  "conversationId": "conversation_id",
  "timestamp": "2024-01-13T10:30:00Z"
}
```

### Conversation Management

#### Get All Conversations

```http
GET /api/conversations
```

Returns a list of all conversation titles and metadata.

#### Create New Conversation

```http
POST /api/conversations
Content-Type: application/json

{
  "title": "My Conversation Title"
}
```

#### Get Conversation Messages

```http
GET /api/conversations/:id
```

Returns all messages in a specific conversation with full context.

#### Update Conversation

```http
PUT /api/conversations/:id
Content-Type: application/json

{
  "title": "Updated Title"
}
```

---

## 💡 How Intelligent Routing Works

### Semantic Routing (Recommended)

The most intelligent approach using vector embeddings:

1. **Vector Generation**: User message is converted to a vector embedding
2. **Similarity Matching**: Vector is compared against pre-computed embeddings for each model category
3. **Cosine Similarity**: Calculates angular distance using dot product
4. **Best Match**: Routes to the model with the highest semantic similarity
5. **Zero-Latency**: Uses pre-computed embeddings for instant routing

**Example:**

- Query: "Write me a poem about space" → **Gemini** (creative tasks)
- Query: "Debug this JavaScript code" → **ChatGPT-4o** (programming)
- Query: "What's the capital of France?" → **Gemma** (factual questions)

### Manual Keyword Routing

Fast, deterministic routing based on keywords:

- Maintains `keywords.js` mapping keywords to model categories
- Checks user message for keyword matches
- Falls back to `DEFAULT_MODEL` if no matches

### Gemma-Powered Selection

AI-assisted classification:

- Uses Gemma LLM to analyze user intent
- Returns structured JSON with model selection
- Flexible but slightly higher latency than semantic routing

---

## 🎯 Smart Features in Detail

### Contextual Memory System

- **Message Storage**: Each message includes role, content, timestamp, and model source
- **Conversation Summaries**: Automatic summaries prevent context overflow
- **Persistence**: MongoDB ensures no conversation is lost
- **Retrieval**: Quick access to any previous conversation
- **Continuity**: Maintains conversation state across sessions

### Model-Aware Responses

- **Transparency**: Users see which model generated each response
- **Quality Tracking**: Compare responses from different models
- **Performance Analysis**: Identify which models work best for specific tasks
- **Failure Recovery**: Fallback to alternative models if primary selection fails

### Embedding-Based Optimization

- **Pre-computed Vectors**: Instant model selection without external API calls
- **Semantic Understanding**: Understands intent beyond keyword matching
- **Scalability**: Handles complex queries with nuanced meanings
- **Accuracy**: High precision in model selection (uses `mxbai-embed-large`)

---

## 🎨 Frontend Experience

### Responsive Design Highlights

#### Desktop Experience (1920px+)

- Full two-column layout with ample spacing
- Large chat area with rich message display
- Visible conversation history sidebar
- Optimal for productivity

#### Tablet Experience (768px - 1024px)

- Collapsible sidebar for more chat space
- Touch-optimized buttons
- Readable font sizes
- Responsive grid system

#### Mobile Experience (320px - 767px)

- Single-column layout
- Hamburger navigation menu
- Full-width chat interface
- Thumb-friendly input areas
- Bottom navigation bar

### Visual Design Elements

- **Gradient Logo**: Blue gradient background (#14275e → #3557bb) with white icon
- **Icon System**: Clean SVG icons from HeroIcons library
- **Color Scheme**: Professional with dark accents (#333c4e) and white panels
- **Typography**: Sans-serif font family for maximum readability
- **Spacing**: Consistent 1.2rem padding and generous gaps between elements
- **Shadows**: Subtle depth effects for modern appearance
- **Transitions**: Smooth hover states for interactive elements

---

## 📦 Dependencies

### Core Framework

- **Express.js** (4.18.2) - Web framework for API routing
- **Node.js** (18+) - JavaScript runtime

### Data & Storage

- **MongoDB** (6.3.0) - NoSQL database for conversations
- **Mongoose** (8.0.0) - MongoDB object modeling

### AI/ML Providers

- **OpenAI** (4.20.0) - ChatGPT-4o API client
- **@google/genai** (1.34.0) - Google Gemini API client
- **cohere-ai** (7.20.0) - Cohere API client
- **ollama** (0.6.3) - Local model inference (Gemma, Mistral)

### Utilities

- **CORS** (2.8.5) - Cross-Origin Resource Sharing
- **dotenv** (16.3.1) - Environment variable management

### Development

- **Nodemon** (3.0.1) - Auto-restart during development

---

## ⚙️ Configuration

### Environment Variables

```env
# Server Port
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/polychat

# API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
COHERE_API_KEY=...

# Model Selection Strategy
DEFAULT_MODEL_SELECTION_METHOD=semantic
DEFAULT_MODEL=gemma
```

### Model Selection Methods

- `semantic` - Vector embedding-based routing (recommended)
- `manual` - Keyword-based routing
- `gemma` - AI-assisted Gemma-based selection

---

## 🔐 Security Considerations

- ✅ **API Key Protection**: Store all API keys in `.env` (never commit to Git)
- ✅ **CORS Enabled**: Configured for safe cross-origin requests
- ✅ **Input Validation**: Messages validated before processing
- ✅ **Error Handling**: Graceful fallbacks for API failures
- ✅ **MongoDB Connection**: Optional fallback to in-memory storage if connection fails

**Important:** Add `.env` to `.gitignore`:

```
.env
.env.local
node_modules/
```

---

## 📊 Performance Optimization

### Embedding Caching

- Pre-computed embeddings stored in `embeddingPhrases.json`
- Zero-latency model selection without API calls
- Significantly reduces response time

### Database Indexing

- MongoDB automatically indexes conversation IDs
- Message timestamps enable efficient sorting
- Summary field optimizes context retrieval

### Graceful Degradation

- Falls back to in-memory storage if MongoDB unavailable
- Switches to default model if routing fails
- Continues operation despite API errors

---

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

Uses Nodemon for automatic server restart on file changes.

### Building Embeddings

```bash
node api/generateEmbedding.js
```

### Testing the API

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

---

## 📈 Future Enhancements

- [ ] User authentication and authorization
- [ ] Conversation export (PDF, Markdown)
- [ ] Real-time collaboration features
- [ ] Advanced search across all conversations
- [ ] Message regeneration from different models
- [ ] Rate limiting and usage analytics
- [ ] Custom model fine-tuning support
- [ ] Voice input/output capabilities
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 🙋 Support & Questions

For issues, questions, or suggestions:

- Open an issue on GitHub
- Check existing documentation
- Review API endpoint documentation above

---

## 🌟 Acknowledgments

- **OpenAI** for ChatGPT-4o
- **Google** for Gemini 3.5 Pro
- **Cohere** for advanced NLP capabilities
- **Ollama** for local model inference
- **HeroIcons** for beautiful SVG icons
- **MongoDB** for robust database solutions
- **Express.js** community for excellent framework

---

<div align="center">

**Made with ❤️ using Node.js, Express, and cutting-edge AI models**

⭐ If you find this project useful, please consider giving it a star!

</div>



## 🚀 Getting Started: Project Setup

Follow these steps in the exact order to set up and run the environment on your local machine.

### 1. Install Ollama

Download and install the Ollama client for Windows to host your local models.

* **Link:** [Download Ollama for Windows](https://ollama.com/download/windows)

### 2. Install Project Dependencies

Navigate to your project folder in the terminal and run:

```bash
npm install

```

### 3. Configure Environment Variables

Locate the `.env.example` file in the root directory.

1. Enter your valid **OpenAI**, **Google**, and **Cohere** API keys.
2. Rename the file from `.env.example` to `.env`.

### 4. Download Local Models

Open **PowerShell** and pull the required lightweight models and the embedding engine:

```powershell
ollama pull gemma:2b
ollama pull mistral:7b
ollama pull mxbai-embed-large

```

### 5. Start the Ollama Server

Initialize the local server to allow the application to communicate with your models:

```powershell
ollama serve

```

### 6. Start the Ollama Server

Change your internet to Phone Hotspot or use a VPN
since `Cohere API` is banned on `IITG_CONNECT`


### 7. Launch the Application

Start the project by running:

```bash
npm start

```

---

## 📌 Technical Notes

### AI-Generated Model Personalities

Because identifying the specific strengths of every model is a specialized task, I utilized AI to generate the `examples` and `keywords` found in `embeddingPhrases.js`, `embeddingPhrases-openai.js`, and `keywords.js`.

* **Example:**  Cohere is assigned phrases like *"help me reindex this list"* due to its reindexing proficiency.
* **Keyword Logic:** Keywords like *"summarise"* were generated for **Gemma:2b** to help the semantic router categorize tasks effectively.

### Model Updates

* **Model Switch:** Please note that **Claude** has been replaced with **Cohere** within the codebase.
