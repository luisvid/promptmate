export async function sendPrompt(
  apiProvider: string,
  apiKey: string,
  payload: unknown
): Promise<string> {
  const response = await fetch(apiProvider, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  const data: any = await response.json();
  if (typeof data === "string") {
    return data;
  }

  if (data.response) {
    return typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  }

  return JSON.stringify(data);
}

// Sends a prompt to the OpenAI API v1/responses endpoint
export async function sendOpenAIPrompt(
  apiKey: string,
  model: string,
  input: string
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ model, input }),
  });

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`
    );
  }

  const data: any = await response.json();
  if (typeof data === "string") {
    return data;
  }

  if (data.response) {
    return typeof data.response === "string"
      ? data.response
      : JSON.stringify(data.response);
  }

  return JSON.stringify(data);
}
