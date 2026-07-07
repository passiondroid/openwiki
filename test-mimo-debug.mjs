import { ChatOpenAI } from "@langchain/openai";

const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  if (typeof init?.body === "string") {
    console.log("=== REQUEST BODY ===");
    console.log(init.body);
  }
  const response = await originalFetch(input, init);
  if (!response.ok) {
    const body = await response.clone().text();
    console.log("=== ERROR RESPONSE ===");
    console.log("Status:", response.status);
    console.log("Body:", body);
  }
  return response;
};

// Test with strict + parallel removed
const model = new ChatOpenAI({
  apiKey: process.env.MIMO_API_KEY,
  configuration: { baseURL: "https://token-plan-sgp.xiaomimimo.com/v1" },
  model: "mimo-v2.5-pro",
  maxCompletionTokens: 16384,
  temperature: 1,
  topP: 0.95,
  frequencyPenalty: 0,
  presencePenalty: 0,
});

const tools = [
  {
    type: "function",
    function: {
      name: "execute",
      description: "Execute a shell command",
      parameters: { type: "object", properties: { command: { type: "string" } }, required: ["command"] },
    },
  },
];

try {
  const res = await model.invoke("List files", { tools, tool_choice: "auto" });
  console.log("=== RESPONSE ===");
  console.log(res.content);
} catch (e) {
  console.log("=== EXCEPTION ===");
  console.log(e.message);
}
