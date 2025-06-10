import * as vscode from 'vscode';

export class SettingsViewProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    constructor(private readonly context: vscode.ExtensionContext) {}

    getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
        const item = new vscode.TreeItem('Open AI Settings');
        item.command = {
            command: 'promptmate.openSettings',
            title: 'Open AI Settings',
        };
        return [item];
    }
}
