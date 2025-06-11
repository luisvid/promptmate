import * as vscode from "vscode";

export interface AISettings {
  apiProvider: string;
  apiKey: string;
  contextFilePath: string;
  model: string;
}

export function getSettings(): AISettings {
  const config = vscode.workspace.getConfiguration("aiPromptSender");
  return {
    apiProvider: config.get("apiProvider", ""),
    apiKey: config.get("apiKey", ""),
    contextFilePath: config.get("contextFilePath", ""),
    model: config.get("model", ""),
  };
}

export async function updateSettings(settings: AISettings): Promise<void> {
  const config = vscode.workspace.getConfiguration("aiPromptSender");
  await config.update(
    "apiProvider",
    settings.apiProvider,
    vscode.ConfigurationTarget.Global
  );
  await config.update(
    "apiKey",
    settings.apiKey,
    vscode.ConfigurationTarget.Global
  );
  await config.update(
    "contextFilePath",
    settings.contextFilePath,
    vscode.ConfigurationTarget.Global
  );
  await config.update(
    "model",
    settings.model,
    vscode.ConfigurationTarget.Global
  );
}
