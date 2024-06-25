import { summaryYouTubeTranscript } from "./langchain-openai.ts";
import { logger, raindropAPI, Config } from "./config.ts";
import {
  normalizeYouTubeURL,
  getTranscript,
  getVideoDetails,
  extractVideoId,
} from "./youtube.ts";

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

  // Normalize link
  const link = await normalizeYouTubeURL(object.link);
  if (link === null) {
    logger.error(`Invalid YouTube URL: ${object.link}`);
    return;
  }

  // Extract video ID
  const videoId = await extractVideoId(link);
  if (videoId === null) {
    logger.error(`Invalid YouTube URL: ${link}`);
    return;
  }

  // Get details from YouTube
  const [title, channel, duration, upload_date] =
    await getVideoDetails(videoId);

  // Get transcript from YouTube
  const transcript = await getTranscript(videoId);

  // Summarize the transcript if available
  let summary = "Podsumowanie: none";
  let usage = "";
  if (transcript === null) {
    logger.error(`Transcription unavailable for: ${link}`);
  } else {
    [summary, usage] = await summaryYouTubeTranscript(transcript);
  }

  // Send the summary to target collection in Raindrop
  const note = `<${channel}> ${title} [${duration}]
---
${link} (${upload_date})
${summary}
${usage}
`;
  const result = await raindropAPI.addItem(
    Config.raindrop_target_collection_id,
    link,
    note,
  );

  if (result) {
    logger.info(`Final success: ${link} ${title}`);
  } else {
    logger.error(`Final failure: ${link} ${title}`);
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
