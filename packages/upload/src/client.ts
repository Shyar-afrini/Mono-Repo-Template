import { useMutation } from "@tanstack/react-query";
import createUploadApi, { UploadedFilePayload } from "./api";

const queryKeys = {
  uploadFile: () => ["upload-file"],
  deleteFilesByIds: () => ["delete-files-by-ids"],
};

class UploadClient {
  private readonly apiClient = createUploadApi();

  getQueryKeys() {
    return queryKeys;
  }

  uploadFile() {
    return useMutation<
      UploadedFilePayload,
      unknown,
      { file: File; path: string }
    >({
      mutationFn: async ({ file, path }) =>
        this.apiClient.uploadFiles({ file, path }),
    });
  }

  deleteFile() {
    return useMutation({
      mutationFn: async (url: string) => this.apiClient.deleteFile(url),
    });
  }

  deleteFilesByIds() {
    return useMutation({
      mutationFn: async (ids: string[]) => this.apiClient.deleteFilesByIds(ids),
    });
  }

  // Utility: resolve full URL from encrypted file path
  getFileUrl(encryptedPath: string): string {
    return this.apiClient.getFileUrlFromPath(encryptedPath);
  }
}

export function createUploadClient() {
  return new UploadClient();
}
