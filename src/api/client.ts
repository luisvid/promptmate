export async function sendPrompt(apiProvider: string, apiKey: string, payload: unknown): Promise<string> {
    const response = await fetch(apiProvider, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    if (typeof data === 'string') {
        return data;
    }

    if (data.response) {
        return typeof data.response === 'string' ? data.response : JSON.stringify(data.response);
    }

    return JSON.stringify(data);
}
