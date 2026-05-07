// upload/api.ts
import { api, setAuthBaseURL } from "@mono-repo-template/axios-client";
import { API_CONFIG, API_PATHS } from "@mono-repo-template/common";
import { isAxiosError } from "axios";

export type UploadedFilePayload = {
  id: string;
  url: string;
  token: string;
};

class UploadApi {
  constructor(baseUrl: string) {
    setAuthBaseURL(baseUrl);
  }

  async uploadFiles({ file, path }: { file: any; path: string }) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    try {
      const response = await api.post(API_PATHS.IMAGES, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response", response.data);
      return response.data.data ?? (response.data as UploadedFilePayload);
    } catch (error) {
      console.error("Error uploading file:", error);
      if (isAxiosError(error)) {
        console.log("AXIOS", error);
      }
      throw error;
    }
  }

  async deleteFile(url: string) {
    try {
      const response = await api.delete(API_PATHS.IMAGES, { data: { url } });
      return response.data.data;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async deleteFilesByIds(ids: string[]) {
    try {
      const response = await api.delete(API_PATHS.IMAGES, { data: { ids } });
      return response.data.data as { success: boolean };
    } catch (error) {
      console.error("Error deleting files by ids:", error);
      throw error;
    }
  }

  getFileUrlFromPath(path: string): string {
    if (!path) return "";
    // Expect path like: /files/:id?token=ENC_TOKEN
    const idMatch = /\/files\/([^?]+)/.exec(path);
    const tokenMatch = /[?&]token=([^&]+)/.exec(path);
    const id = idMatch?.[1];
    const token = tokenMatch?.[1];

    if (id && token) {
      return `${API_CONFIG.BASE_URL}/files/${id}?token=${token}`;
    }

    // Fallback: prefix as-is when parsing fails
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${API_CONFIG.BASE_URL}${normalized}`;
  }
}

export default function createUploadApi(baseUrl: string = API_CONFIG.BASE_URL) {
  return new UploadApi(baseUrl);
}
