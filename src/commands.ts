import * as vscode from 'vscode';
import { MainPanel } from './webviews/mainPanel';
import { SettingsPanel } from './webviews/settingsPanel';

export function registerCommands(context: vscode.ExtensionContext, main: MainPanel, settings: SettingsPanel) {
    context.subscriptions.push(
        vscode.commands.registerCommand('promptmate.sendPrompt', () => main.show()),
        vscode.commands.registerCommand('promptmate.openSettings', () => settings.show()),
    );
}
