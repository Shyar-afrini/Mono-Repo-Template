import { api } from "@mono-repo-template/axios-client";
import { Document } from "@mono-repo-template/types";

export interface CreateDocumentInput {
  images: string[];
  type: "NATIONAL" | "LICENSE" | "PASSPORT" | "RESIDENCE" | "OTHER";
  expiryDate: string; // ISO string
  issuedBy: string;
  adminId?: string;
}

class DocumentsAPI {
  async createDocument(document: CreateDocumentInput) {
    try {
      const response = await api.post("/documents", document);
      return response.data.data as Document;
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }

  async getDocumentById(id: string) {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data.data as Document;
    } catch (error) {
      console.error("Error fetching document:", error);
      throw error;
    }
  }

  async getDocumentByUserId(userId: string) {
    try {
      const response = await api.get(`/users/${userId}/documents`);
      return response.data.data as Document[];
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  }
}

export default function createDocumentsAPI() {
  return new DocumentsAPI();
}
