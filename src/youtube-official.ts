import { Config } from "./config.ts";


function YTDurationToSeconds(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) {
    return "0";
  }

  const parts = match.slice(1).map(function(x) {
    if (x != null) {
      return x.replace(/\D/, '') || "0";
    }
    return "0";
  });

  const hours = (parseInt(parts[0]) || 0);
  const minutes = (parseInt(parts[1]) || 0);
  const seconds = (parseInt(parts[2]) || 0);

  // Use format HH:MM:SS
  const hoursStr = hours.toString().padStart(2, '0');
  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');
  return `${hoursStr}:${minutesStr}:${secondsStr}`;
}

export async function getVideoDetails(
  videoId: string,
): Promise<[string, string, string, string]> {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?` +
    new URLSearchParams({
      part: "contentDetails,snippet",
      id: videoId,
      key: Config.youtube_api_key,
    })
  );
  const data = await response.json();

  const videoTitle = data.items[0].snippet.title;
  const videoChannel = data.items[0].snippet.channelTitle;
  const videoUploadDate = data.items[0].snippet.publishedAt;
  const rawDuration = data.items[0].contentDetails.duration;
  const videoLength = YTDurationToSeconds(rawDuration);

  return [videoTitle, videoChannel, videoLength, videoUploadDate];
}
