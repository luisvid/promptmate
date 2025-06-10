# PromptMate

PromptMate is a simple VS Code extension for sending prompts to an AI service from within the editor. It provides a command to send a prompt and a settings panel where you can configure the API details.

## Features

- **Send Prompt to AI** command available from the Command Palette.
- **AI Settings** view under the Extensions sidebar to configure the API provider, key and context file.
- Responses from the AI are displayed directly in the extension panel.

## Setup

1. Run `npm install` to install dependencies.
2. Press `F5` in VS Code to launch an Extension Development Host.

## Obtaining an API Key

PromptMate expects an HTTP endpoint that accepts a JSON payload with a `prompt` field. Many AI providers expose such APIs. For example, you can create an API key on [OpenAI](https://platform.openai.com/) and set the provider to their completion endpoint.

## Usage

1. Open the **AI Settings** view from the Extensions side bar and fill in:
   - **API Provider**: URL of the endpoint.
   - **API Key**: your authentication key.
   - **Context File Path**: absolute path to a file whose contents should be prepended to your prompt.
2. Run **Send Prompt to AI** from the Command Palette.
3. Enter your prompt and press **Send** to see the AI's response.

All errors are shown inside the panel.
