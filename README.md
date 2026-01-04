Please go through the following steps in order to run the project

1 Install Ollama on your device

2 Install the lightweight `gemma:2b` and `mistral:7b` and `mxbai-embed-large` models in your Ollama 
by 
`ollama pull gemma:2b`
`ollama pull mistral:7b`
`ollama pull mxbai-embed-large`

3 After it is installed start the ollama server first
`ollama serve`

4 Give a valid OpenAI, Google, Anthropic api key in the `.env`

5 Run the file called `generateEmbedding-openai.js` by `node ./api/generateEmbedding-openai.js`

6 Start the project at by `npm start`










## NOTE
since i do not have any idea of what the personality of any model is, i have used AI for generating the `examples` corresponding to each AI in the `embeddingPhrases.js` and `embeddingPhrases-openai.js` for e.g for claude :- `help me write this code` is an example as claude is good in coding , i did not know this therefore this portion was AI generated

Also the `keywords` for each model in the `keywords.js` is AI generated as i do not know what are the keywords for each AI and their personality e.g it generated `summarise` for `gemma:2b` model which is impoosible to figure out myself as i am not a MODEL engineer


NOTE => I realised after the `claude` was replaced with `cohere` thereofore i have made the corrections on code but in Video i have used `claude` only