import { summaryYouTubeTranscript } from "./langchain-openai.ts";
import { logger, raindropAPI, Config } from "./config.ts";
import {
  normalizeYouTubeURL,
  getTranscript,
  getVideoDetails as getVideoDetailsInertube,
  extractVideoId,
} from "./youtube-innertube.ts";
import { getVideoDetails as getVideoDetailsOfficial } from "./youtube-official.ts";
import type { RaindropItem } from "raindrop-api";

async function main() {
  // Get link
  const { object, msg, status } = await raindropAPI.getFirstItemFromCollection(
    Config.raindrop_source_collection_id,
  );
  if (!status || object === null || object._id === undefined) {
    logger.debug(msg);
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

  // Get details from YouTube (2 ways: Inertube or Official API)
  let title: string | undefined;
  let channel: string | undefined;
  let duration: string | undefined;
  let upload_date: string | undefined;
  if (Config.youtube_api === "innertube") {
    [title, channel, duration, upload_date] =
      await getVideoDetailsInertube(videoId);
  } else {
    [title, channel, duration, upload_date] =
      await getVideoDetailsOfficial(videoId);
  }

  // Duration format: HH:MM:SS
  // Convert duration to seconds
  const duration_parts = duration.split(":");
  const seconds = Number(duration_parts[0]) * 3600 +
    Number(duration_parts[1]) * 60 +
    Number(duration_parts[2]);
  // Skip videos shorter than X seconds
  if (0 < seconds && seconds < Config.skip_videos_shorter_than) {
    logger.info(`Skipping video shorter than ${Config.skip_videos_shorter_than} seconds: ${link}`);
    return;
  }

  // Get transcript from YouTube (only Inertube supports transcripts)
  let transcript: string | null = null;
  if (Config.youtube_api === "innertube") {
    transcript = await getTranscript(videoId);
  }

  // Summarize the transcript if available
  let summary = "Podsumowanie: none";
  let usage = "";
  if (transcript === null) {
    logger.error(`Transcription unavailable for: ${link}`);
  } else {
    [summary, usage] = await summaryYouTubeTranscript(transcript);
  }

  // Send the summary to target collection in Raindrop
  const note = `Upload date: ${upload_date}
---
${summary}
${usage}
`;

  const item: RaindropItem = {
    title: `<${channel}> ${title} [${duration}]`,
    link: link,
    note: note,
    collection: {
      $id: Number(Config.raindrop_target_collection_id),
    }
  };

  const result = await raindropAPI.addItem(item);

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
