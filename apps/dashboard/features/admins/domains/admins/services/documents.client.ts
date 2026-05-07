/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery } from "@tanstack/react-query";
import createDocumentsAPI from "./documents.api";
import type { CreateDocumentInput } from "./documents.api";
import { Document } from "@mono-repo-template/types";

const documentsQueryKeys = {
  createDocument: () => ["documents", "create"],
  getDocument: (id: string) => ["documents", id],
  getDocumentByUserId: (userId: string) => ["documents", "user", userId],
};

class DocumentsClient {
  public readonly documentsAPI = createDocumentsAPI();

  getQueryKeys() {
    return documentsQueryKeys;
  }

  useCreateDocument() {
    return useMutation<Document, Error, CreateDocumentInput>({
      mutationKey: documentsQueryKeys.createDocument(),
      mutationFn: async (document: CreateDocumentInput) =>
        await this.documentsAPI.createDocument(document),
    });
  }

  useGetDocumentById(id: string) {
    return useQuery<Document, Error>({
      queryKey: documentsQueryKeys.getDocument(id),
      queryFn: async () => await this.documentsAPI.getDocumentById(id),
      enabled: !!id,
    });
  }

  useGetDocumentByUserId(userId: string) {
    return useQuery<Document[], Error>({
      queryKey: documentsQueryKeys.getDocumentByUserId(userId),
      queryFn: async () => await this.documentsAPI.getDocumentByUserId(userId),
      enabled: !!userId,
    });
  }
}

export default function createDocumentsClient() {
  return new DocumentsClient();
}
