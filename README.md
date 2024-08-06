# YouTube Summarizer

YouTube Summarizer is a tool that integrates with Raindrop.io
to manage a queue of YouTube links, pull their transcriptions,
generate summaries using OpenAI, and send the summaries back to Raindrop.io.


## 🎁  Features

- **Queue Management**: Use Raindrop.io to manage a queue of YouTube links.
- **Transcription**: Automatically pull transcriptions for YouTube videos.
- **Summarization**: Generate summaries of YouTube transcriptions using OpenAI.
- **Integration**: Send the generated summaries back to Raindrop.io.


## 📝 Prerequisites

- Docker
- Docker Compose
- [Bun](https://bun.sh/) (JavaScript runtime; drop-in replacement for Node.js)
- [Raindrop.io](https://raindrop.io/) account
- [OpenAI API Key](https://platform.openai.com/docs/quickstart/account-setup)


## 🛠️ Installation

1. Clone the repository:
```sh
git clone https://github.com/yourusername/youtube-summarizer.git
cd youtube-summarizer
```

2. Copy the configuration template and edit it:

```shell
cp config/_template.yaml config/production.yaml
# Edit config/production.yaml with your preferred settings
```

3. Build and start the application using Docker Compose:

```shell
docker compose build
docker compose up -d
```


## 🧪 Development

Install the dependencies:

```shell
bun install
```

To start the application for local development:

```shell
bun src/index.ts config/production.yaml
```

To run a single script:

```shell
bun <script_name>
```

To run tests, you can execute the test functions directly
in the [./src/langchain-openai.ts](./src/langchain-openai.ts)
or [./src/youtube.ts](./src/youtube.ts) files.
For more details, see the script's `if (import.meta.main) {}` block.


## 📦 Building the Docker Image

To build the Docker image:

```shell
docker buildx build --platform linux/arm64 -t local/youtube-summarizer .
```


## 🧽 Formatting Code

To format the code using Prettier:

```shell
bun x prettier --write .
```


## License

This project is licensed under the MIT License.
