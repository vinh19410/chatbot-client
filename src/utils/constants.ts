export const COOKIE_MAX_AGE_1_YEAR = 365 * 24 * 60 * 60;
export const AI_OPTION = [
  {
    id: "openai",
    name: "OpenAI",
    chatEndpoint: "https://api.openai.com/v1/chat/completions",
    imageGeneration: true,
    models: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
];

export const LANGS = [
  {
    value: "en",
    title: "Tiếng Anh",
  },
  {
    value: "vn",
    title: "Tiếng Việt",
  },
];
