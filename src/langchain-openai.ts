import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";
import { logger, Config } from "./config.ts";

export async function summaryYouTubeTranscript(transcript: string) {
  const systemPrompt = Config.prompt;

  const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.2,
    topP: 0.9,
    apiKey: Config.openai_api_key,
  });

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    ["user", "{input}"],
  ]);

  const chain = prompt.pipe(model);

  let response: AIMessage;
  try {
    response = await chain.invoke({
      input: transcript,
    });
  } catch (error) {
    logger.error(`Failed to summarize the transcript: ${error}`);
    return [String(error), ""];
  }
  if (response.content !== null && response.content !== undefined) {
    // Convert flat JSON object to key=value pairs
    const key_value_usage = Object.entries(
      response.response_metadata.tokenUsage,
    )
      .map(([key, value]) => `${key}=${value}`)
      .join(" ");
    return [String(response.content), String(key_value_usage)];
  } else {
    return ["", ""];
  }
}

// ----------------------------------------------------------------------------
// For testing purposes
// If you run this file directly (https://bun.sh/docs/api/import-meta)
if (import.meta.main) {
  const youtube = await import("./youtube.ts");

  async function test_one() {
    // Podrabianie sprzętu komputerowego, w tym #cisco, #yubikey - Mateusz Chrobok
    const transcript_1 = await youtube.getTranscript(
      "oDlMrMgGGA4",
    );
    if (transcript_1 === null) {
      console.log("Transcript is null");
      return;
    }
    console.log(transcript_1);
    console.log("--------------------------------------------------");
    const [summary_1, usage_1] = await summaryYouTubeTranscript(transcript_1);
    console.log(summary_1);
    console.log(usage_1);
  }

  async function test_two() {
    // O co chodzi z Passkeys? Pytacie, odpowiadam(y). Q&A @secfense
    const transcript_1 = await youtube.getTranscript(
      "rf6LriO_dy8",
    );
    if (transcript_1 === null) {
      console.log("Transcript is null");
      return;
    }
    console.log(transcript_1);
    console.log("--------------------------------------------------");
    const [summary_1, usage_1] = await summaryYouTubeTranscript(transcript_1);
    console.log(summary_1);
    console.log(usage_1);
  }

  await test_one();
  // await test_two();
}
