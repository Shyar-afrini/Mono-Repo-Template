import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";

// ---- base URLs set by the app at startup
let _apiBase = "";
let _authBase = "";

// Call these once (e.g., in Expo root)
export function setApiBaseURL(url: string) {
  _apiBase = url;
}
export function setAuthBaseURL(url: string) {
  _authBase = url;
}

// ---- axios instances
export const api = axios.create({ timeout: 10_000, withCredentials: true });
export const auth = axios.create({ timeout: 10_000, withCredentials: true });

// Inject baseURL lazily so you can still override per-call with { baseURL }
api.interceptors.request.use((cfg) => {
  if (!cfg.baseURL) cfg.baseURL = _apiBase;
  return cfg;
});

auth.interceptors.request.use((cfg) => {
  if (!cfg.baseURL) cfg.baseURL = _authBase;
  return cfg;
});

// (Optional) token injection for API
let _getToken:
  | (() => string | undefined | Promise<string | undefined | null>)
  | undefined;
export function setTokenGetter(fn: typeof _getToken) {
  _getToken = fn;
}

// (Optional) token injection for auth
let _getAuthToken:
  | (() => string | undefined | Promise<string | undefined | null>)
  | undefined;
export function setAuthTokenGetter(fn: typeof _getAuthToken) {
  _getAuthToken = fn;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await _getToken?.();
  config.headers = AxiosHeaders.from(config.headers);

  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

auth.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await _getAuthToken?.();
  config.headers = AxiosHeaders.from(config.headers);

  if (token) {
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});
