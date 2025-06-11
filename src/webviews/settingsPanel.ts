import * as vscode from "vscode";
import { getSettings, updateSettings, AISettings } from "../settings";

export class SettingsPanel {
  public static readonly viewType = "promptmate.settingsPanel";
  private panel: vscode.WebviewPanel | undefined;

  constructor(private readonly context: vscode.ExtensionContext) {}

  public show() {
    if (this.panel) {
      this.panel.reveal();
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      SettingsPanel.viewType,
      "AI Settings",
      vscode.ViewColumn.Active,
      { enableScripts: true }
    );

    this.panel.onDidDispose(() => {
      this.panel = undefined;
    });

    this.panel.webview.html = this.getHtml();
    this.panel.webview.onDidReceiveMessage(async (msg) => {
      switch (msg.command) {
        case "save":
          await this.handleSave(msg.settings);
          break;
        case "browse":
          await this.handleBrowse();
          break;
      }
    });
  }

  private async handleSave(settings: AISettings) {
    if (!this.panel) {
      return;
    }
    try {
      if (
        !settings.model ||
        !settings.apiProvider ||
        !settings.apiKey ||
        !settings.contextFilePath
      ) {
        throw new Error("All fields are required.");
      }
      await updateSettings(settings);
      this.panel.webview.postMessage({ command: "saved" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.panel.webview.postMessage({ command: "error", text: msg });
    }
  }

  private async handleBrowse() {
    if (!this.panel) {
      return;
    }
    const uri = await vscode.window.showOpenDialog({
      canSelectMany: false,
      openLabel: "Select context file",
    });
    if (uri && uri[0]) {
      this.panel.webview.postMessage({
        command: "contextPath",
        path: uri[0].fsPath,
      });
    }
  }

  private getHtml(): string {
    const nonce = getNonce();
    const settings = getSettings();
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Settings</title>
    <style nonce="${nonce}">
        body { font-family: sans-serif; margin: 0; padding: 1rem; }
        input[type=text], input[type=password] { width: 100%; }
        label { display: block; margin-top: 0.5rem; }
        #message { color: red; margin-top: 0.5rem; }
        button { margin-top: 1rem; }
    </style>
</head>
<body>
    <label>Model
        <input id="model" type="text" value="${settings.model || ""}" />
    </label>
    <label>API Provider
        <input id="provider" type="text" value="${settings.apiProvider}" />
    </label>
    <label>API Key
        <input id="key" type="password" value="${settings.apiKey}" />
    </label>
    <label>Context File Path
        <input id="context" type="text" value="${settings.contextFilePath}" />
        <button id="browse" type="button">Browse...</button>
    </label>
    <div id="message"></div>
    <button id="save">Save</button>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        document.getElementById('save').addEventListener('click', () => {
            const settings = {
                model: document.getElementById('model').value,
                apiProvider: document.getElementById('provider').value,
                apiKey: document.getElementById('key').value,
                contextFilePath: document.getElementById('context').value
            };
            vscode.postMessage({ command: 'save', settings });
        });
        document.getElementById('browse').addEventListener('click', () => {
            vscode.postMessage({ command: 'browse' });
        });
        window.addEventListener('message', event => {
            const msg = event.data;
            if (msg.command === 'error') {
                document.getElementById('message').textContent = msg.text;
            }
            if (msg.command === 'saved') {
                document.getElementById('message').style.color = 'green';
                document.getElementById('message').textContent = 'Settings saved';
            }
            if (msg.command === 'contextPath') {
                document.getElementById('context').value = msg.path;
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
