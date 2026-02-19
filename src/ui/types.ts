// Configuration for ChatGPT API requests
export interface ChatGPTConfig {
  model: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}

// Structure of a ChatGPT API response
export interface ChatGPTResponse {
  content: string;
  isArray: boolean;
  items: any[] | null;
}

// History item structure for storing prompt/response pairs
export interface HistoryItem {
  id: string;
  prompt: string;
  response: any[];
  timestamp: number;
  textElementCount: number;
  success: boolean;
  saved: boolean;
  category: string;
}

// Message sent from plugin to UI
export interface UIMessage {
  type: string;
  [key: string]: any;
}

// Message sent from UI to plugin
export interface PluginMessage {
  type: string;
  [key: string]: any;
}

// Quality categories for few-shot prompting
export type QualityCategory =
  | "emails"
  | "headlines"
  | "us_phones"
  | "addresses"
  | "dates"
  | "prices"
  | "product_names"
  | "skus"
  | "order_ids"
  | "times"
  | "durations";

// Category display names
export const CATEGORY_DISPLAY_NAMES: Record<QualityCategory | "", string> = {
  "": "Generic",
  emails: "Emails",
  headlines: "Headlines",
  us_phones: "US Phone Numbers",
  addresses: "Addresses",
  dates: "Dates",
  prices: "Prices",
  product_names: "Product Names",
  skus: "SKUs",
  order_ids: "Order IDs",
  times: "Times",
  durations: "Durations",
};

// Toast types
export type ToastType = "success" | "error" | "critical";

// Toast item structure
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}
