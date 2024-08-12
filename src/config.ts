import * as fs from "fs";
import * as yaml from "js-yaml";
import { SimpleFMTLogger } from "simple-fmt-logger";
import { Raindrop } from "raindrop-api";
import { OpenAI } from "openai";

interface ConfigSchema {
  log_level: string;
  openai_api_key: string;
  raindrop_token: string;
  raindrop_source_collection_id: string;
  raindrop_target_collection_id: string;
  prompt: string;

  [key: string]: any;
}

function validateConfig(config: ConfigSchema) {
  const requiredFields = [
    "log_level",
    "openai_api_key",
    "raindrop_token",
    "raindrop_source_collection_id",
    "raindrop_target_collection_id",
    "prompt",
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Load the config file
const configPath = process.argv[2] || "config.yaml";
export const Config = yaml.load(
  fs.readFileSync(configPath, "utf8"),
) as ConfigSchema;
validateConfig(Config);

// Initialize the logger
export const logger = new SimpleFMTLogger(Config.log_level || "info");

// Initialize the Raindrop API
export const raindropAPI = new Raindrop(Config.raindrop_token);

// Initialize the OpenAI API
export const openaiConnection = new OpenAI({
  apiKey: Config.openai_api_key,
});
