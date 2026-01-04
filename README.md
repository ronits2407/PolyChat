Please go through the following steps in order to run the project

1 Install Ollama on your device

2 Install the lightweight `gemma:2b` and `mistral:7b` models in your Ollama 
by 
`ollama pull gemma:2b`
`ollama pull mistral:7b`

3 After it is installed start the ollama server first
`ollama serve`

4 Give a valid OpenAI, Google, Anthropic api key in the `.env`

5 Run the file called `generateEmbedding-openai.js` by `node ./api/generateEmbedding-openai.js`

6 Start the project at by `npm start`
