import * as vscode from "vscode";
import { getSettings } from "../settings";
import { sendOpenAIPrompt, sendPrompt } from "../api/client";
import * as fs from "fs/promises";

export class MainPanel {
  public static readonly viewType = "promptmate.mainPanel";
  private panel: vscode.WebviewPanel | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      MainPanel.viewType,
      "Send Prompt to AI",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.webview.html = this.getHtml();
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case "send":
          await this.handleSend(msg.prompt);
          break;
      }
    });
  }

  private async handleSend(prompt: string) {
    if (!this.panel) {
      return;
    }
    const webview = this.panel.webview;
    try {
      const settings = getSettings();
      if (
        !settings.apiProvider ||
        !settings.apiKey ||
        !settings.contextFilePath
      ) {
        throw new Error(
          "Please configure API Provider, API Key, and Context File Path."
        );
      }
      const context = await fs.readFile(settings.contextFilePath, "utf8");
      const payload = {
        prompt: `${context}\n${prompt}`,
      };
      // const responseRaw = await sendOpenAIPrompt(
      //   settings.apiKey,
      //   "gpt-3.5-turbo", // settings.model,
      //   payload.prompt
      // );
      const responseRaw = await sendPrompt(
        settings.apiProvider,
        settings.apiKey,
        settings.model,
        payload.prompt,
        {}, // extraHeaders
        {}, // extraPayload
        true // useMessages: send as chat/messages format
      );

      let responseText = responseRaw;
      let logInfo = null;
      try {
        const parsed = JSON.parse(responseRaw);
        // Extract the main text from OpenAI chat/completions response
        if (
          parsed &&
          parsed.choices &&
          Array.isArray(parsed.choices) &&
          parsed.choices.length > 0 &&
          parsed.choices[0].message &&
          typeof parsed.choices[0].message.content === "string"
        ) {
          responseText = parsed.choices[0].message.content;
        } else if (
          parsed &&
          parsed.output &&
          Array.isArray(parsed.output) &&
          parsed.output.length > 0 &&
          parsed.output[0].content &&
          Array.isArray(parsed.output[0].content) &&
          parsed.output[0].content.length > 0 &&
          parsed.output[0].content[0].text
        ) {
          responseText = parsed.output[0].content[0].text;
        }
        logInfo = { ...parsed };
        if (logInfo.choices) {
          logInfo.choices = undefined;
        }
        if (logInfo.output) {
          logInfo.output = undefined;
        }
      } catch (e) {
        // Not JSON, just show as is
      }
      if (logInfo) {
        console.log("[PromptMate] Full response info:", logInfo);
      }
      webview.postMessage({ command: "reply", text: responseText });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      webview.postMessage({ command: "error", text: msg });
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Send Prompt to AI</title>
    <style nonce="${nonce}">
        body { font-family: sans-serif; margin: 0; padding: 1rem; }
        textarea { width: 100%; height: 8rem; }
        #response { margin-top: 1rem; white-space: pre-wrap; border: 1px solid #ccc; padding: 0.5rem; min-height: 4rem; }
        button { margin-top: 0.5rem; }
    </style>
</head>
<body>
    <textarea id="prompt" placeholder="Enter your prompt"></textarea>
    <br/>
    <button id="send">Send</button>
    <div id="response"></div>
    <div id="loading" style="display:none;margin-top:0.5rem;visibility:hidden;">⏳ Waiting for response...</div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const sendBtn = document.getElementById('send');
        const promptInput = document.getElementById('prompt');
        const responseDiv = document.getElementById('response');
        const loadingDiv = document.getElementById('loading');
        loadingDiv.style.display = 'none';
        loadingDiv.style.visibility = 'hidden';
        sendBtn.addEventListener('click', () => {
            const prompt = promptInput.value;
            if (!prompt.trim()) return;
            responseDiv.textContent = '';
            loadingDiv.style.display = 'block';
            loadingDiv.style.visibility = 'visible';
            sendBtn.disabled = true;
            promptInput.disabled = true;
            vscode.postMessage({ command: 'send', prompt });
        });
        window.addEventListener('message', event => {
            const msg = event.data;
            loadingDiv.style.display = 'none';
            loadingDiv.style.visibility = 'hidden';
            sendBtn.disabled = false;
            promptInput.disabled = false;
            if (msg.command === 'reply') {
                responseDiv.textContent = msg.text;
            }
            if (msg.command === 'error') {
                responseDiv.textContent = 'Error: ' + msg.text;
            }
        });
    </script>
</body>
</html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
