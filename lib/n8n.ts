interface N8NWebhookOptions {
  endpoint: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  userLogin: string;
  telegramUsername?: string; // For Telegram-specific requests
}

export async function callN8NWebhook<T>({
  endpoint,
  method = "POST",
  body = {},
  userLogin,
  telegramUsername,
}: N8NWebhookOptions): Promise<T> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;

  if (!baseUrl) {
    throw new Error("N8N_WEBHOOK_BASE_URL not configured");
  }

  const url = `${baseUrl}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add webhook security header if configured
  const webhookSecret = process.env.N8N_WEBHOOK_SECRET;
  if (webhookSecret) {
    headers["X-N8N-Secret"] = webhookSecret;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (method === "POST") {
    const requestBody: Record<string, unknown> = { ...body, userLogin };
    if (telegramUsername) {
      requestBody.username = telegramUsername;
    }
    options.body = JSON.stringify(requestBody);
  } else {
    const params = new URLSearchParams({ userLogin });
    if (telegramUsername) {
      params.set("username", telegramUsername);
    }
    const urlWithParams = `${url}?${params.toString()}`;
    const response = await fetch(urlWithParams, options);

    if (!response.ok) {
      throw new Error(`n8n webhook error: ${response.statusText}`);
    }

    return response.json();
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`n8n webhook error: ${response.statusText}`);
  }

  return response.json();
}
