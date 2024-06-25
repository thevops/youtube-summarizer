import { Innertube } from "youtubei.js/web";

export async function extractVideoId(videoUrl: string): Promise<string | null> {
  const urlParts = videoUrl.split("v=");
  if (urlParts.length > 1) {
    const videoId = urlParts[1].split("&")[0];
    return videoId;
  }
  return null;
}

export async function normalizeYouTubeURL(
  videoUrl: string,
): Promise<string | null> {
  const videoId = await extractVideoId(videoUrl);
  if (videoId === null) {
    return null;
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function getTranscript(videoId: string): Promise<string | null> {
  const youtube = await Innertube.create();

  try {
    const info = await youtube.getInfo(videoId);
    const defaultTranscriptInfo = await info.getTranscript();
    const languages = defaultTranscriptInfo.languages;
    // Select the first language available
    const transcript = await defaultTranscriptInfo.selectLanguage(languages[0]);
    return (
      transcript.transcript.content?.body?.initial_segments
        .map((segment) => segment.snippet)
        .join(" ") ?? ""
    );
  } catch (error) {
    return null;
  }
}

export async function getVideoDetails(
  videoId: string,
): Promise<[string | undefined, string | undefined, string, string]> {
  const youtube = await Innertube.create();

  const videoBasicInfo = await youtube.getBasicInfo(videoId);
  const videoTitle = videoBasicInfo.basic_info.title;
  const videoChannel = videoBasicInfo.basic_info.author;
  const videoLengthSeconds = videoBasicInfo.basic_info.duration ?? 0;
  // Convert seconds to HH:MM:SS format
  const videoLength = new Date(videoLengthSeconds * 1000)
    .toISOString()
    .slice(11, 19);

  const videoInfo = await youtube.getInfo(videoId);
  const videoUploadDate = videoInfo.primary_info?.published.text ?? "No date";

  return [videoTitle, videoChannel, videoLength, videoUploadDate];
}

// ----------------------------------------------------------------------------
// For testing purposes
// If you run this file directly (https://bun.sh/docs/api/import-meta)
if (import.meta.main) {
  async function test_getTranscript() {
    // Jak pół sekundy uratowało świat przed zagładą? - Mateusz Chrobok
    const transcript_1 = await getTranscript(
      "https://www.youtube.com/watch?v=44HSTVBvAO4",
    );
    console.log(transcript_1);
    console.log("--------------------------------------------------");

    // Nix for Everyone: Unleash Devbox for Simplified Development - DevOps Toolkit
    const transcript_2 = await getTranscript(
      "https://www.youtube.com/watch?v=WiFLtcBvGMU",
    );
    console.log(transcript_2);
    console.log("--------------------------------------------------");

    // J.K. Rowling czeka na bycie aresztowaną? | Przegląd Idei #111 (08.04.2024) - Szymon mówi
    const transcript_3 = await getTranscript(
      "https://www.youtube.com/watch?v=Rcw-eWn8hWQ",
    );
    console.log(transcript_3);
  }

  async function test_getVideoDetails() {
    // const videoUrl = "https://www.youtube.com/watch?v=rK8gII2FWqA";
    const videoUrl2 = "https://www.youtube.com/watch?v=44HSTVBvAO4";
    const [title, channel, duration, upload_date] =
      await getVideoDetails(videoUrl2);
    console.log(`${title} ${channel} ${duration} ${upload_date}`);
  }

  /*
      Run tests
  */
  // await test_getTranscript();
  // await test_getVideoDetails();
}
