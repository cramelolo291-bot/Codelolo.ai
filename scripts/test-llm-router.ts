// Focused provider-routing tests: OpenAI is preferred when configured,
// credentials stay on the server-side request, and local fallback still works.
import { routeChat, selectProvider } from "../server/routes/llm-router";

let pass = 0;
let fail = 0;
function check(label: string, condition: boolean) {
  if (condition) {
    pass += 1;
    console.log(`  ok   ${label}`);
  } else {
    fail += 1;
    console.error(`  FAIL ${label}`);
  }
}

const messages = [{ role: "user" as const, content: "Halo" }];
const selected = selectProvider({ openaiKey: "sk-test", openrouterKey: "" });
check("OpenAI is preferred when key is configured", selected.provider === "openai");
check("OpenAI default model is gpt-4.1-mini", selected.model === "gpt-4.1-mini");

let seenUrl = "";
let seenAuthorization = "";
const fakeFetch: typeof fetch = async (input, init) => {
  seenUrl = String(input);
  seenAuthorization = new Headers(init?.headers).get("authorization") ?? "";
  return new Response(JSON.stringify({
    choices: [{ message: { content: "Jawaban OpenAI test" } }],
  }), { status: 200, headers: { "content-type": "application/json" } });
};

const result = await routeChat(
  { openaiKey: "sk-test-secret", openrouterKey: "" },
  { messages },
  fakeFetch,
);
check("calls OpenAI chat completions endpoint", seenUrl === "https://api.openai.com/v1/chat/completions");
check("sends secret in server-side Authorization header", seenAuthorization === "Bearer sk-test-secret");
check("returns OpenAI provider and response", result.provider === "openai" && result.content === "Jawaban OpenAI test");
check("does not report fallback for a successful OpenAI request", result.fellBack === false);

let ollamaHit = false;
const fallbackFetch: typeof fetch = async (input) => {
  const url = String(input);
  if (url.startsWith("https://api.openai.com/")) {
    return new Response(JSON.stringify({ error: { message: "invalid key" } }), { status: 401 });
  }
  if (url === "http://ollama.test/api/chat") {
    ollamaHit = true;
    return new Response(JSON.stringify({ message: { content: "Jawaban lokal" } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response("not found", { status: 404 });
};
const fallback = await routeChat(
  { openaiKey: "sk-bad", openrouterKey: "", localBase: "http://ollama.test" },
  { messages },
  fallbackFetch,
);
check("falls back to Ollama when OpenAI fails and no OpenRouter key exists", ollamaHit && fallback.provider === "ollama" && fallback.fellBack);

console.log(`\n${pass} passed, ${fail} failed\n`);
if (fail) process.exit(1);
