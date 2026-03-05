export type UploadType = "profile-photo" | "profile-cover" | "project-media";

export interface StorageProvider {
  /** Gera URL assinada para upload direto do browser */
  generatePresignedUrl(key: string, contentType: string): Promise<string>;

  /** Retorna URL pública para acessar o arquivo */
  getPublicUrl(key: string): string;

  /** Gera a key/path do arquivo no storage */
  buildKey(
    userId: string,
    type: UploadType,
    projectId: string | null,
    fileName: string
  ): string;

  /** Deleta um arquivo do storage */
  delete(key: string): Promise<void>;
}
