import { SPFI } from '@pnp/sp';
import { ISignaturePosition } from '../services/PdfService';

/**
 * Props cho PdfSignerComponent
 */
export interface IPdfSignerProps {
    /** PnPjs SP instance */
    sp: SPFI;
    /** Tên Document Library chứa chữ ký */
    signatureLibraryName: string;
    /** Tên SharePoint List chứa danh sách người ký */
    approvalListName: string;
    /** Tên Document Library lưu PDF đã ký */
    signedOutputLibrary: string;
    /** Chiều rộng chữ ký (px) */
    signatureWidth: number;
    /** Chiều cao chữ ký (px) */
    signatureHeight: number;
    /** Tự động điền ngày ký */
    autoFillDate: boolean;
    /** Định dạng ngày */
    dateFormat: string;
    /** Có đang trong SharePoint context không */
    hasContext: boolean;
    /** Cấu hình vị trí chữ ký tùy chỉnh (nếu có) */
    signaturePositions?: ISignaturePosition[];
}
