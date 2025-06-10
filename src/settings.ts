import * as vscode from 'vscode';

export interface AISettings {
    apiProvider: string;
    apiKey: string;
    contextFilePath: string;
}

export function getSettings(): AISettings {
    const config = vscode.workspace.getConfiguration('aiPromptSender');
    return {
        apiProvider: config.get('apiProvider', ''),
        apiKey: config.get('apiKey', ''),
        contextFilePath: config.get('contextFilePath', ''),
    };
}

export async function updateSettings(settings: AISettings): Promise<void> {
    const config = vscode.workspace.getConfiguration('aiPromptSender');
    await config.update('apiProvider', settings.apiProvider, vscode.ConfigurationTarget.Global);
    await config.update('apiKey', settings.apiKey, vscode.ConfigurationTarget.Global);
    await config.update('contextFilePath', settings.contextFilePath, vscode.ConfigurationTarget.Global);
}
