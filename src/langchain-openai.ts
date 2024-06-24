import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage } from "@langchain/core/messages";
import { logger, Config } from "./config.ts";

export async function summaryYouTubeTranscript(transcript: string) {
  const systemPrompt = `Can you provide a comprehensive summary of the given text? The summary should cover all the key points and main ideas presented in the original text, while also condensing the information into a concise and easy-to-understand format. Please ensure that the summary includes relevant details and examples that support the main ideas, while avoiding any unnecessary information or repetition. The length of the summary should be appropriate for the length and complexity of the original text, providing a clear and accurate overview without omitting any important information. The summary must be written in polish language and Markdown format. At the end of the summary, please provide a list of keywords that best describe the content of the text.

  Output format:
  # Podsumowanie
  <summary>

  Słowa kluczowe: <keywords>`;

  const model = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.2,
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
      "https://www.youtube.com/watch?v=oDlMrMgGGA4",
    );
    console.log(transcript_1);
    console.log("--------------------------------------------------");
    const [summary_1, usage_1] = await summaryYouTubeTranscript(transcript_1);
    console.log(summary_1);
    console.log(usage_1);
  }

  async function test_two() {
    // O co chodzi z Passkeys? Pytacie, odpowiadam(y). Q&A @secfense
    const transcript_1 = await youtube.getTranscript(
      "https://www.youtube.com/watch?v=rf6LriO_dy8",
    );
    console.log(transcript_1);
    console.log("--------------------------------------------------");
    const [summary_1, usage_1] = await summaryYouTubeTranscript(transcript_1);
    console.log(summary_1);
    console.log(usage_1);
  }

  // await test_one();
  // await test_two();
}
