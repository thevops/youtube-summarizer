import { summaryYouTubeTranscript } from "./langchain-openai.ts";
import { logger, raindropAPI, Config } from "./config.ts";
import { getTranscript, getVideoDetails } from "./youtube.ts";

async function main() {
  // Get link
  const { object, msg, status } = await raindropAPI.getFirstItemFromCollection(
    Config.raindrop_source_collection_id,
  );
  if (!status) {
    logger.info(msg);
    return;
  }

  // Remove the link from Raindrop
  await raindropAPI.removeItem(object._id.toString());

  // Get details from YouTube
  const [title, channel, duration, upload_date] = await getVideoDetails(
    object.link,
  );
  // Get transcript from YouTube
  const transcript = await getTranscript(object.link);

  // Summarize the transcript if available
  let summary = "Podsumowanie: none";
  let usage = "";
  if (transcript !== "") {
    [summary, usage] = await summaryYouTubeTranscript(transcript);
  }

  // Send the summary to target collection in Raindrop
  const note = `<${channel}> ${title} [${duration}]
---
${object.link} (${upload_date})
${summary}
${usage}
`;
  const result = await raindropAPI.addItem(
    Config.raindrop_target_collection_id,
    object.link,
    note,
  );

  if (result) {
    logger.info(`Final success: ${object.link} ${title}`);
  } else {
    logger.error(`Final failure: ${object.link} ${title}`);
  }
}

async function runForever() {
  logger.info("Starting...");
  while (true) {
    await main();
    // Sleep for 30 seconds
    await new Promise((resolve) => setTimeout(resolve, 30 * 1000));
  }
}

runForever();
