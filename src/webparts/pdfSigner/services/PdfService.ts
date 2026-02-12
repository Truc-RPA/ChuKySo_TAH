/**
 * PdfService.ts
 * Service layer xử lý PDF bằng pdf-lib: load, embed chữ ký, thêm ngày ký, save.
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

/**
 * Cấu hình vị trí chữ ký trên PDF template
 */
export interface ISignaturePosition {
    row: number;       // Thứ tự dòng ký (1-based)
    x: number;         // Tọa độ X (từ trái)
    y: number;         // Tọa độ Y (từ dưới lên)
    dateX?: number;    // Tọa độ X cho ngày ký (nếu khác vị trí mặc định)
    dateY?: number;    // Tọa độ Y cho ngày ký
}

/**
 * Cấu hình xử lý PDF
 */
export interface IPdfProcessConfig {
    signatureWidth: number;
    signatureHeight: number;
    autoFillDate: boolean;
    dateFormat: string;
    pageIndex?: number;  // Trang chứa bảng ký (default: 0 = trang cuối)
}

/**
 * Vị trí mẫu cho template PDF cố định.
 * CẦN CHỈNH LẠI cho phù hợp với PDF thực tế.
 */
export const DEFAULT_SIGNATURE_POSITIONS: ISignaturePosition[] = [
    { row: 1, x: 420, y: 520, dateX: 350, dateY: 525 },
    { row: 2, x: 420, y: 480, dateX: 350, dateY: 485 },
    { row: 3, x: 420, y: 440, dateX: 350, dateY: 445 },
    { row: 4, x: 420, y: 400, dateX: 350, dateY: 405 },
    { row: 5, x: 420, y: 360, dateX: 350, dateY: 365 },
    { row: 6, x: 420, y: 320, dateX: 350, dateY: 325 },
    { row: 7, x: 420, y: 280, dateX: 350, dateY: 285 },
    { row: 8, x: 420, y: 240, dateX: 350, dateY: 245 },
    { row: 9, x: 420, y: 200, dateX: 350, dateY: 205 },
    { row: 10, x: 420, y: 160, dateX: 350, dateY: 165 }
];

export class PdfService {

    /**
     * Load PDF từ ArrayBuffer
     * @param buffer ArrayBuffer của file PDF
     * @returns PDFDocument object
     */
    public async loadPdf(buffer: ArrayBuffer): Promise<PDFDocument> {
        try {
            const pdfDoc = await PDFDocument.load(buffer, {
                ignoreEncryption: true
            });
            return pdfDoc;
        } catch (error) {
            console.error('Lỗi khi load PDF:', error);
            throw new Error('Không thể đọc file PDF. Vui lòng kiểm tra file có hợp lệ.');
        }
    }

    /**
     * Embed ảnh chữ ký PNG vào PDF tại tọa độ chỉ định
     * @param pdfDoc PDFDocument
     * @param page PDF page cần chèn
     * @param imageBytes Mảng byte của ảnh PNG
     * @param x Tọa độ X
     * @param y Tọa độ Y
     * @param width Chiều rộng chữ ký
     * @param height Chiều cao chữ ký
     */
    public async embedSignature(
        pdfDoc: PDFDocument,
        page: PDFPage,
        imageBytes: Uint8Array,
        x: number,
        y: number,
        width: number,
        height: number
    ): Promise<void> {
        try {
            const pngImage = await pdfDoc.embedPng(imageBytes);

            // Tính toán kích thước giữ tỷ lệ
            const aspectRatio = pngImage.width / pngImage.height;
            let drawWidth = width;
            let drawHeight = height;

            if (aspectRatio > width / height) {
                // Ảnh rộng hơn vùng chứa -> fit theo width
                drawHeight = width / aspectRatio;
            } else {
                // Ảnh cao hơn vùng chứa -> fit theo height
                drawWidth = height * aspectRatio;
            }

            page.drawImage(pngImage, {
                x: x,
                y: y,
                width: drawWidth,
                height: drawHeight
            });
        } catch (error) {
            console.error('Lỗi khi embed chữ ký:', error);
            throw new Error('Không thể chèn ảnh chữ ký vào PDF. Ảnh có thể không phải định dạng PNG hợp lệ.');
        }
    }

    /**
     * Vẽ ngày ký lên PDF
     * @param page PDF page
     * @param x Tọa độ X
     * @param y Tọa độ Y
     * @param dateStr Chuỗi ngày ký
     * @param fontSize Cỡ chữ (default: 9)
     */
    public embedDate(
        page: PDFPage,
        x: number,
        y: number,
        dateStr: string,
        fontSize: number = 9
    ): void {
        try {
            page.drawText(dateStr, {
                x: x,
                y: y,
                size: fontSize,
                color: rgb(0, 0, 0) // Màu đen
            });
        } catch (error) {
            console.error('Lỗi khi ghi ngày ký:', error);
        }
    }

    /**
     * Lưu PDFDocument thành Uint8Array
     * @param pdfDoc PDFDocument
     * @returns Uint8Array của PDF
     */
    public async savePdf(pdfDoc: PDFDocument): Promise<Uint8Array> {
        try {
            return await pdfDoc.save();
        } catch (error) {
            console.error('Lỗi khi lưu PDF:', error);
            throw new Error('Không thể lưu file PDF.');
        }
    }

    /**
     * Xử lý toàn bộ flow ký PDF
     * @param pdfBuffer ArrayBuffer của PDF gốc
     * @param signerImages Map<order, imageBytes> - ảnh chữ ký đã load (theo order)
     * @param positions Danh sách vị trí chữ ký
     * @param config Cấu hình
     * @returns Uint8Array của PDF đã ký
     */
    public async processSignatures(
        pdfBuffer: ArrayBuffer,
        signerImages: Map<number, Uint8Array>,
        positions: ISignaturePosition[],
        config: IPdfProcessConfig
    ): Promise<Uint8Array> {
        const pdfDoc = await this.loadPdf(pdfBuffer);
        const pages = pdfDoc.getPages();

        // Lấy trang cuối cùng (thường là trang có bảng ký)
        const pageIndex = config.pageIndex !== undefined
            ? config.pageIndex
            : pages.length - 1;

        if (pageIndex < 0 || pageIndex >= pages.length) {
            throw new Error(`Trang ${pageIndex + 1} không tồn tại trong PDF (tổng: ${pages.length} trang).`);
        }

        const page = pages[pageIndex];
        const currentDate = this.formatDate(new Date(), config.dateFormat);

        // Lặp qua từng vị trí ký
        for (const position of positions) {
            const imageBytes = signerImages.get(position.row);
            if (imageBytes) {
                // Chèn chữ ký
                await this.embedSignature(
                    pdfDoc,
                    page,
                    imageBytes,
                    position.x,
                    position.y,
                    config.signatureWidth,
                    config.signatureHeight
                );

                // Tự động điền ngày ký nếu cấu hình cho phép
                if (config.autoFillDate) {
                    const dateX = position.dateX || position.x - 70;
                    const dateY = position.dateY || position.y + 5;
                    this.embedDate(page, dateX, dateY, currentDate);
                }
            }
        }

        return this.savePdf(pdfDoc);
    }

    /**
     * Format ngày theo định dạng chỉ định
     * @param date Date object
     * @param format Định dạng (dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd)
     * @returns Chuỗi ngày đã format
     */
    public formatDate(date: Date, format: string): string {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString();

        return format
            .replace('dd', day)
            .replace('MM', month)
            .replace('yyyy', year);
    }
}
