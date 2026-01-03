const OpenAI = require("openai");
const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function GenerateManifest() {
  const manifest_old = JSON.parse(
    fs.readFileSync("./api/embeddingPhrases-openai.json", "utf-8")
  );

  for (const model of manifest_old) {
    model.embeddings = [];

    for (const sentence of model.examples) {
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: sentence,
        });

        const vector = response.data[0].embedding;
        model.embeddings.push(vector);

        console.log(`Embedded`);
      } catch (error) {
        console.error(`Error\n`, error.message);
      }
    }
  }

  fs.writeFileSync(
    "./api/embeddingPhrases-openai.json",
    JSON.stringify(manifest_old, null, 2)
  );
}

GenerateManifest();
