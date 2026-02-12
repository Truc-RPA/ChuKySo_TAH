/**
 * SignatureService.ts
 * Service layer để truy cập SharePoint: lấy danh sách người ký và chữ ký hình ảnh.
 */

import { SPFI } from '@pnp/sp';
import '@pnp/sp/presets/all';
import { NameNormalizer } from './NameNormalizer';

/**
 * Thông tin người ký từ ApprovalList
 */
export interface ISigner {
    fullName: string;
    role: string;
    order: number;
}

/**
 * Kết quả tìm chữ ký
 */
export interface ISignatureResult {
    signer: ISigner;
    found: boolean;
    imageBytes: Uint8Array | null;
    fileName: string;
    errorMessage?: string;
}

/**
 * Kết quả xử lý tổng thể
 */
export interface IProcessingResult {
    success: boolean;
    signedPdfBytes: Uint8Array | null;
    results: ISignatureResult[];
    outputFileName: string;
    errorMessage?: string;
}

export class SignatureService {
    private sp: SPFI;
    private signatureCache: Map<string, Uint8Array>;

    constructor(sp: SPFI) {
        this.sp = sp;
        this.signatureCache = new Map<string, Uint8Array>();
    }

    /**
     * Lấy danh sách người ký từ SharePoint List, sắp xếp theo Order
     * @param listName Tên list (default: ApprovalList)
     * @returns Danh sách người ký
     */
    public async getSignerList(listName: string): Promise<ISigner[]> {
        try {
            const items = await this.sp.web.lists
                .getByTitle(listName)
                .items
                .select('FullName', 'Role', 'Order0')
                .orderBy('Order0', true)();

            return items.map((item: { FullName: string; Role: string; Order0: number }) => ({
                fullName: item.FullName || '',
                role: item.Role || '',
                order: item.Order0 || 0
            }));
        } catch (error) {
            console.error(`Lỗi khi lấy danh sách người ký từ list "${listName}":`, error);
            throw new Error(`Không thể lấy danh sách người ký từ "${listName}". Vui lòng kiểm tra list có tồn tại và bạn có quyền truy cập.`);
        }
    }

    /**
     * Tìm và download ảnh chữ ký từ Document Library.
     * Sử dụng cache để tránh download lại.
     * @param fullName Họ và tên người ký
     * @param libraryName Tên Document Library chứa chữ ký
     * @returns Mảng byte của ảnh PNG hoặc null nếu không tìm thấy
     */
    public async getSignatureImage(fullName: string, libraryName: string): Promise<Uint8Array | null> {
        // Kiểm tra cache trước
        const cacheKey = NameNormalizer.normalize(fullName);
        if (this.signatureCache.has(cacheKey)) {
            return this.signatureCache.get(cacheKey)!;
        }

        try {
            // Thử tìm chính xác theo tên file chuẩn: Signature_{FullName}.png
            const expectedFileName = NameNormalizer.toSignatureFileName(fullName);

            try {
                const fileBuffer = await this.sp.web
                    .getFolderByServerRelativePath(libraryName)
                    .files
                    .getByUrl(expectedFileName)
                    .getBuffer();

                const imageBytes = new Uint8Array(fileBuffer);
                this.signatureCache.set(cacheKey, imageBytes);
                return imageBytes;
            } catch {
                // File không tìm thấy theo tên chính xác, thử tìm bằng cách so khớp
            }

            // Fallback: Lấy tất cả files trong library và so khớp tên
            const files = await this.sp.web
                .getFolderByServerRelativePath(libraryName)
                .files
                .select('Name', 'ServerRelativeUrl')
                .filter("substringof('.png', Name) or substringof('.PNG', Name)")();

            for (const file of files) {
                const fileName: string = file.Name || '';
                // Trích xuất tên từ file: Signature_{FullName}.png
                const match = fileName.match(/^Signature_(.+)\.png$/i);
                if (match) {
                    const fileFullName = match[1];
                    if (NameNormalizer.isMatch(fileFullName, fullName)) {
                        const fileBuffer = await this.sp.web
                            .getFileByServerRelativePath(file.ServerRelativeUrl)
                            .getBuffer();

                        const imageBytes = new Uint8Array(fileBuffer);
                        this.signatureCache.set(cacheKey, imageBytes);
                        return imageBytes;
                    }
                }
            }

            // Không tìm thấy chữ ký
            return null;
        } catch (error) {
            console.error(`Lỗi khi tìm chữ ký cho "${fullName}":`, error);
            return null;
        }
    }

    /**
     * Upload file PDF đã ký vào Document Library
     * @param libraryName Tên Document Library đích
     * @param fileName Tên file mới
     * @param fileContent Nội dung file dạng Uint8Array
     */
    public async uploadSignedPdf(
        libraryName: string,
        fileName: string,
        fileContent: Uint8Array
    ): Promise<string> {
        try {
            // Kiểm tra folder tồn tại
            try {
                await this.sp.web.getFolderByServerRelativePath(libraryName)();
            } catch {
                throw new Error(`Document Library "${libraryName}" không tồn tại. Vui lòng tạo trước.`);
            }

            const result = await this.sp.web
                .getFolderByServerRelativePath(libraryName)
                .files
                .addUsingPath(fileName, new Blob([fileContent as unknown as BlobPart]), { Overwrite: true });

            return (result.data as { ServerRelativeUrl: string }).ServerRelativeUrl || '';
        } catch (error) {
            console.error(`Lỗi khi upload file "${fileName}":`, error);
            throw new Error(`Không thể upload file "${fileName}" vào "${libraryName}". ${(error as Error).message}`);
        }
    }

    /**
     * Kiểm tra quyền upload của user hiện tại
     * @param libraryName Tên Document Library
     * @returns true nếu user có quyền upload
     */
    public async checkUploadPermission(libraryName: string): Promise<boolean> {
        try {
            // Thử lấy thông tin list - nếu thành công thì user có quyền truy cập
            const list = await this.sp.web.lists.getByTitle(libraryName)();
            return !!list;
        } catch {
            return false;
        }
    }

    /**
     * Xóa cache chữ ký
     */
    public clearCache(): void {
        this.signatureCache.clear();
    }
}
