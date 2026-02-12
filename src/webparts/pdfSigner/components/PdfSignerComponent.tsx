import * as React from 'react';
import styles from './PdfSignerComponent.module.scss';
import { IPdfSignerProps } from './IPdfSignerProps';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { ProgressIndicator } from 'office-ui-fabric-react/lib/ProgressIndicator';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { SignatureService, ISigner, ISignatureResult } from '../services/SignatureService';
import { PdfService, DEFAULT_SIGNATURE_POSITIONS, ISignaturePosition } from '../services/PdfService';

/**
 * Trạng thái xử lý
 */
enum ProcessingStatus {
    Idle = 'idle',
    Loading = 'loading',
    CheckingSignatures = 'checking',
    EmbeddingImages = 'embedding',
    SavingFile = 'saving',
    UploadingFile = 'uploading',
    Done = 'done',
    Error = 'error'
}

/**
 * State cho component
 */
interface IPdfSignerState {
    /** File PDF đã chọn */
    selectedFile: File | null;
    /** Trạng thái xử lý */
    status: ProcessingStatus;
    /** Thông báo trạng thái hiện tại */
    statusMessage: string;
    /** Progress (0 - 1) */
    progress: number;
    /** Danh sách người ký */
    signers: ISigner[];
    /** Kết quả xử lý cho từng người ký */
    signatureResults: ISignatureResult[];
    /** PDF đã ký (để download) */
    signedPdfBytes: Uint8Array | null;
    /** Tên file output */
    outputFileName: string;
    /** Thông báo lỗi chung */
    errorMessage: string;
    /** Thông báo thành công */
    successMessage: string;
    /** URL file đã upload */
    uploadedFileUrl: string;
}

export default class PdfSignerComponent extends React.Component<IPdfSignerProps, IPdfSignerState> {
    private signatureService: SignatureService;
    private pdfService: PdfService;
    private fileInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: IPdfSignerProps) {
        super(props);

        this.signatureService = new SignatureService(props.sp);
        this.pdfService = new PdfService();
        this.fileInputRef = React.createRef<HTMLInputElement>();

        this.state = {
            selectedFile: null,
            status: ProcessingStatus.Idle,
            statusMessage: '',
            progress: 0,
            signers: [],
            signatureResults: [],
            signedPdfBytes: null,
            outputFileName: '',
            errorMessage: '',
            successMessage: '',
            uploadedFileUrl: ''
        };
    }

    /**
     * Xử lý chọn file PDF
     */
    private handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const files = event.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                this.setState({ errorMessage: 'Vui lòng chọn file PDF.' });
                return;
            }
            this.setState({
                selectedFile: file,
                errorMessage: '',
                successMessage: '',
                signatureResults: [],
                signedPdfBytes: null,
                status: ProcessingStatus.Idle,
                outputFileName: `Signed_${file.name}`
            });
        }
    }

    /**
     * Mở dialog chọn file
     */
    private triggerFileUpload = (): void => {
        if (this.fileInputRef.current) {
            this.fileInputRef.current.click();
        }
    }

    /**
     * Xử lý ký PDF - main flow
     */
    private handleSignPdf = async (): Promise<void> => {
        const { selectedFile } = this.state;
        const {
            signatureLibraryName,
            approvalListName,
            signedOutputLibrary,
            signatureWidth,
            signatureHeight,
            autoFillDate,
            dateFormat
        } = this.props;

        if (!selectedFile) {
            this.setState({ errorMessage: 'Vui lòng chọn file PDF trước.' });
            return;
        }

        const results: ISignatureResult[] = [];

        try {
            // === BƯỚC 1: Kiểm tra quyền ===
            this.setState({
                status: ProcessingStatus.Loading,
                statusMessage: 'Đang kiểm tra quyền...',
                progress: 0.05,
                errorMessage: '',
                successMessage: ''
            });

            const hasPermission = await this.signatureService.checkUploadPermission(signedOutputLibrary);
            if (!hasPermission) {
                this.setState({
                    status: ProcessingStatus.Error,
                    errorMessage: `Bạn không có quyền upload vào thư viện "${signedOutputLibrary}".`
                });
                return;
            }

            // === BƯỚC 2: Đọc file PDF ===
            this.setState({
                statusMessage: 'Đang đọc file PDF...',
                progress: 0.1
            });

            const pdfBuffer = await this.readFileAsArrayBuffer(selectedFile);

            // === BƯỚC 3: Lấy danh sách người ký ===
            this.setState({
                status: ProcessingStatus.CheckingSignatures,
                statusMessage: 'Đang lấy danh sách người ký...',
                progress: 0.2
            });

            const signers = await this.signatureService.getSignerList(approvalListName);
            this.setState({ signers });

            if (signers.length === 0) {
                this.setState({
                    status: ProcessingStatus.Error,
                    errorMessage: `Không tìm thấy người ký nào trong list "${approvalListName}".`
                });
                return;
            }

            // === BƯỚC 4: Tìm và load chữ ký cho từng người ===
            this.setState({
                statusMessage: 'Đang kiểm tra chữ ký...',
                progress: 0.3
            });

            const signerImages = new Map<number, Uint8Array>();

            for (let i = 0; i < signers.length; i++) {
                const signer = signers[i];
                const progressValue = 0.3 + (0.3 * (i / signers.length));

                this.setState({
                    statusMessage: `Đang tìm chữ ký: ${signer.fullName}...`,
                    progress: progressValue
                });

                const imageBytes = await this.signatureService.getSignatureImage(
                    signer.fullName,
                    signatureLibraryName
                );

                const result: ISignatureResult = {
                    signer: signer,
                    found: imageBytes !== null,
                    imageBytes: imageBytes,
                    fileName: `Signature_${signer.fullName}.png`,
                    errorMessage: imageBytes ? undefined : 'Không tìm thấy chữ ký'
                };

                results.push(result);

                if (imageBytes) {
                    signerImages.set(signer.order, imageBytes);
                }

                this.setState({ signatureResults: [...results] });
            }

            // === BƯỚC 5: Embed chữ ký vào PDF ===
            this.setState({
                status: ProcessingStatus.EmbeddingImages,
                statusMessage: 'Đang chèn chữ ký vào PDF...',
                progress: 0.65
            });

            const positions: ISignaturePosition[] = this.props.signaturePositions || DEFAULT_SIGNATURE_POSITIONS;

            const signedPdfBytes = await this.pdfService.processSignatures(
                pdfBuffer,
                signerImages,
                positions,
                {
                    signatureWidth,
                    signatureHeight,
                    autoFillDate,
                    dateFormat
                }
            );

            // === BƯỚC 6: Upload PDF đã ký ===
            this.setState({
                status: ProcessingStatus.UploadingFile,
                statusMessage: 'Đang upload PDF đã ký...',
                progress: 0.85
            });

            const outputFileName = `Signed_${selectedFile.name}`;
            const uploadedUrl = await this.signatureService.uploadSignedPdf(
                signedOutputLibrary,
                outputFileName,
                signedPdfBytes
            );

            // === HOÀN TẤT ===
            const successCount = results.filter(r => r.found).length;
            const failCount = results.filter(r => !r.found).length;

            this.setState({
                status: ProcessingStatus.Done,
                statusMessage: 'Hoàn tất!',
                progress: 1,
                signedPdfBytes,
                outputFileName,
                uploadedFileUrl: uploadedUrl,
                successMessage: `Đã ký thành công ${successCount}/${signers.length} chữ ký. ${failCount > 0 ? `${failCount} chữ ký không tìm thấy.` : ''}`
            });

        } catch (error) {
            console.error('Lỗi khi xử lý PDF:', error);
            this.setState({
                status: ProcessingStatus.Error,
                errorMessage: `Lỗi: ${(error as Error).message}`,
                signatureResults: results
            });
        }
    }

    /**
     * Đọc file thành ArrayBuffer
     */
    private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.onerror = () => reject(new Error('Không thể đọc file.'));
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Download PDF đã ký
     */
    private handleDownload = (): void => {
        const { signedPdfBytes, outputFileName } = this.state;
        if (!signedPdfBytes) return;

        const blob = new Blob([signedPdfBytes as BlobPart], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = outputFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Reset về trạng thái ban đầu
     */
    private handleReset = (): void => {
        this.signatureService.clearCache();
        this.setState({
            selectedFile: null,
            status: ProcessingStatus.Idle,
            statusMessage: '',
            progress: 0,
            signers: [],
            signatureResults: [],
            signedPdfBytes: null,
            outputFileName: '',
            errorMessage: '',
            successMessage: '',
            uploadedFileUrl: ''
        });
        if (this.fileInputRef.current) {
            this.fileInputRef.current.value = '';
        }
    }

    /**
     * Format kích thước file
     */
    private formatFileSize(bytes: number): string {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    }

    /**
     * Render trạng thái progress steps
     */
    private renderProgressSteps(): React.ReactElement {
        const { status } = this.state;
        const steps = [
            { key: ProcessingStatus.Loading, label: 'Kiểm tra quyền & đọc file...' },
            { key: ProcessingStatus.CheckingSignatures, label: 'Kiểm tra chữ ký...' },
            { key: ProcessingStatus.EmbeddingImages, label: 'Chèn chữ ký vào PDF...' },
            { key: ProcessingStatus.SavingFile, label: 'Lưu file PDF...' },
            { key: ProcessingStatus.UploadingFile, label: 'Upload lên SharePoint...' }
        ];

        const statusOrder = [
            ProcessingStatus.Loading,
            ProcessingStatus.CheckingSignatures,
            ProcessingStatus.EmbeddingImages,
            ProcessingStatus.SavingFile,
            ProcessingStatus.UploadingFile,
            ProcessingStatus.Done
        ];

        const currentIndex = statusOrder.indexOf(status);

        return (
            <div className={styles.progressSection}>
                {steps.map((step, idx) => {
                    let stepClass = styles.progressStep;
                    let icon = '○';

                    if (idx < currentIndex) {
                        stepClass += ` ${styles.progressStepDone}`;
                        icon = '✔';
                    } else if (idx === currentIndex) {
                        stepClass += ` ${styles.progressStepActive}`;
                        icon = '►';
                    }

                    if (status === ProcessingStatus.Error && idx === currentIndex) {
                        stepClass += ` ${styles.progressStepError}`;
                        icon = '✖';
                    }

                    return (
                        <div key={step.key} className={stepClass}>
                            <span>{icon}</span>
                            <span>{step.label}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    /**
     * Render bảng kết quả chữ ký
     */
    private renderSignerResults(): React.ReactElement | null {
        const { signatureResults } = this.state;
        if (signatureResults.length === 0) return null;

        return (
            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                    <Icon iconName="ContactList" />
                    Kết quả kiểm tra chữ ký
                </h3>
                <table className={styles.signerTable}>
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Họ và tên</th>
                            <th>Vai trò</th>
                            <th>Chữ ký</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {signatureResults.map((result, index) => (
                            <tr key={index}>
                                <td>{result.signer.order}</td>
                                <td>{result.signer.fullName}</td>
                                <td>{result.signer.role}</td>
                                <td>{result.fileName}</td>
                                <td>
                                    {result.found ? (
                                        <span className={styles.statusSuccess}>
                                            ✔ Đã tìm thấy
                                        </span>
                                    ) : (
                                        <span className={styles.statusError}>
                                            ❌ Chưa có chữ ký
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    public render(): React.ReactElement<IPdfSignerProps> {
        const {
            selectedFile,
            status,
            statusMessage,
            progress,
            errorMessage,
            successMessage,
            signedPdfBytes,
            outputFileName,
            uploadedFileUrl
        } = this.state;

        const { hasContext } = this.props;
        const isProcessing = status !== ProcessingStatus.Idle &&
            status !== ProcessingStatus.Done &&
            status !== ProcessingStatus.Error;

        // Không có SharePoint context
        if (!hasContext) {
            return (
                <div className={styles.pdfSigner}>
                    <div className={styles.noContext}>
                        <div className={styles.noContextIcon}>
                            <Icon iconName="Warning" />
                        </div>
                        <p className={styles.noContextText}>
                            WebPart này cần chạy trong môi trường SharePoint Online.
                            <br />Vui lòng thêm vào một SharePoint page để sử dụng.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.pdfSigner}>
                {/* === HEADER === */}
                <div className={styles.header}>
                    <Icon iconName="PDF" className={styles.headerIcon} />
                    <div>
                        <h2 className={styles.headerTitle}>PDF Auto Signer</h2>
                        <p className={styles.headerSubtitle}>
                            Tự động chèn chữ ký vào file PDF từ thư viện SharePoint
                        </p>
                    </div>
                </div>

                {/* === THÔNG BÁO LỖI === */}
                {errorMessage && (
                    <MessageBar
                        messageBarType={MessageBarType.error}
                        onDismiss={() => this.setState({ errorMessage: '' })}
                        dismissButtonAriaLabel="Đóng"
                    >
                        {errorMessage}
                    </MessageBar>
                )}

                {/* === THÔNG BÁO THÀNH CÔNG === */}
                {successMessage && (
                    <MessageBar
                        messageBarType={MessageBarType.success}
                        onDismiss={() => this.setState({ successMessage: '' })}
                        dismissButtonAriaLabel="Đóng"
                    >
                        {successMessage}
                    </MessageBar>
                )}

                {/* === UPLOAD PDF === */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Icon iconName="Upload" />
                        Bước 1: Chọn file PDF
                    </h3>

                    <input
                        ref={this.fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={this.handleFileSelect}
                        style={{ display: 'none' }}
                    />

                    {!selectedFile ? (
                        <div
                            className={styles.uploadArea}
                            onClick={this.triggerFileUpload}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') this.triggerFileUpload(); }}
                        >
                            <div className={styles.uploadIcon}>
                                <Icon iconName="CloudUpload" />
                            </div>
                            <p className={styles.uploadText}>
                                Nhấn để chọn file PDF hoặc kéo thả vào đây
                            </p>
                        </div>
                    ) : (
                        <div className={styles.fileInfo}>
                            <span className={styles.fileInfoName}>
                                <Icon iconName="PDF" />
                                {selectedFile.name}
                            </span>
                            <span className={styles.fileInfoSize}>
                                {this.formatFileSize(selectedFile.size)}
                            </span>
                        </div>
                    )}
                </div>

                {/* === NÚT HÀNH ĐỘNG === */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>
                        <Icon iconName="Processing" />
                        Bước 2: Ký PDF
                    </h3>

                    <div className={styles.actionButtons}>
                        <PrimaryButton
                            text={isProcessing ? 'Đang xử lý...' : 'Ký PDF tự động'}
                            iconProps={{ iconName: 'EditCreate' }}
                            onClick={this.handleSignPdf}
                            disabled={!selectedFile || isProcessing}
                        />
                        <DefaultButton
                            text="Chọn file khác"
                            iconProps={{ iconName: 'Refresh' }}
                            onClick={this.handleReset}
                            disabled={isProcessing}
                        />
                    </div>

                    {/* Progress */}
                    {isProcessing && (
                        <>
                            <ProgressIndicator
                                label={statusMessage}
                                percentComplete={progress}
                                styles={{ root: { marginTop: 16 } }}
                            />
                            {this.renderProgressSteps()}
                        </>
                    )}
                </div>

                {/* === KẾT QUẢ CHỮ KÝ === */}
                {this.renderSignerResults()}

                {/* === KẾT QUẢ CUỐI CÙNG === */}
                {status === ProcessingStatus.Done && signedPdfBytes && (
                    <div className={`${styles.resultSection} ${styles.resultSuccess}`}>
                        <h3 className={styles.resultTitle}>
                            ✔ Ký PDF thành công!
                        </h3>
                        <p className={styles.resultMessage}>
                            File đã được lưu tại: <strong>{outputFileName}</strong>
                            {uploadedFileUrl && (
                                <>
                                    <br />
                                    Đường dẫn SharePoint: <a href={uploadedFileUrl} target="_blank" rel="noopener noreferrer">{uploadedFileUrl}</a>
                                </>
                            )}
                        </p>
                        <div className={styles.downloadButton}>
                            <PrimaryButton
                                text="Tải PDF đã ký"
                                iconProps={{ iconName: 'Download' }}
                                onClick={this.handleDownload}
                            />
                        </div>
                    </div>
                )}

                {/* === LỖI CUỐI CÙNG === */}
                {status === ProcessingStatus.Error && (
                    <div className={`${styles.resultSection} ${styles.resultError}`}>
                        <h3 className={styles.resultTitle}>
                            ✖ Không thể hoàn tất
                        </h3>
                        <p className={styles.resultMessage}>{errorMessage}</p>
                        <div className={styles.downloadButton}>
                            <DefaultButton
                                text="Thử lại"
                                iconProps={{ iconName: 'Refresh' }}
                                onClick={this.handleReset}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
