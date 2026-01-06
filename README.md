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