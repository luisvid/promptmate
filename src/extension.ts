import * as vscode from 'vscode';
import { MainPanel } from './webviews/mainPanel';
import { SettingsPanel } from './webviews/settingsPanel';
import { registerCommands } from './commands';
import { SettingsViewProvider } from './views/settingsView';

export function activate(context: vscode.ExtensionContext) {
    const mainPanel = new MainPanel(context);
    const settingsPanel = new SettingsPanel(context);

    registerCommands(context, mainPanel, settingsPanel);

    const settingsView = new SettingsViewProvider(context);
    vscode.window.registerTreeDataProvider('promptmate.settingsView', settingsView);
}

export function deactivate() {}
