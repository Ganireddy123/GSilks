import axios from "axios";
import APIConfig, { privateEndPoints, publicEndPoints } from "./constant";

export const TOKEN_KEY = "gsilks-token";
const API_HOST = APIConfig.hostname;
const backendOrigin = new URL(API_HOST, window.location.origin).origin;

const AppAPI = {};

[publicEndPoints, privateEndPoints].forEach((endpointMap) => {
  endpointMap.forEach((endpoint, key) => {
    AppAPI[key] = {};
    endpoint.methods.forEach((method) => {
      AppAPI[key][method] = (params, payload, requestOptions = {}) =>
        fetcher(method, key, endpoint.path, params, payload, requestOptions);
    });
  });
});

async function fetcher(method, key, inputEndpoint, inputParams, body, requestOptions) {
  let endpoint = inputEndpoint;
  const queryParams = inputParams && typeof inputParams === "object" ? { ...inputParams } : {};

  endpoint = endpoint.replace(/:([A-Za-z0-9_]+)/g, (match, paramName) => {
    if (queryParams[paramName] === undefined || queryParams[paramName] === null) {
      throw new Error(`Missing path parameter "${paramName}" for ${key}.`);
    }
    const value = encodeURIComponent(queryParams[paramName]);
    delete queryParams[paramName];
    return value;
  });

  if (typeof inputParams === "string") endpoint += inputParams;

  const headers = { Accept: "application/json", ...requestOptions.headers };
  if (!(typeof FormData !== "undefined" && body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (privateEndPoints.has(key)) {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await axios.request({
      baseURL: API_HOST,
      url: endpoint,
      method,
      headers,
      params: Object.keys(queryParams).length ? queryParams : undefined,
      data: body,
      ...requestOptions,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || "Could not connect to the GSilks server.";
    throw new Error(message, { cause: error });
  }
}

export function resolveAssetUrl(url) {
  if (!url) return "";
  if (url.startsWith("/uploads/")) return `${backendOrigin}${url}`;
  return url;
}

export default AppAPI;
