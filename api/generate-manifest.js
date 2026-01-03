const ollama = require("ollama").default
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config()


async function GenerateManifest(){
    const manifest_old = JSON.parse(fs.readFileSync("./api/manifest.json", "utf-8"));

    console.log("Creating Embeddings...")

    for (const model of manifest_old) {
        for (const sentense of model.examples) {
            try {
                const response = await ollama.embed({
                    model : "mistral:7b",
                    input: sentense,
                })

                const vector = response.embeddings[0];

                model.embeddings.push(vector);

                console.log("Succesfully embedded "+model)
            } catch (error) {
                console.error("Something went wrong while getting response from Ollama")
                console.error(error)
            }
        }
    }

    fs.writeFileSync("./api/manifest.json", JSON.stringify(manifest_old, null, 2))


}

GenerateManifest()

module.exports = {GenerateManifest}