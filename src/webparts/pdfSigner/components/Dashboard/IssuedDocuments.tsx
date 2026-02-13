import * as React from 'react';
import { DetailsList, IColumn, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface IIssuedDocumentsProps {
    sp: any; // PnPjs instance
    description?: string;
    // Bạn có thể thêm các props khác từ WebPart cũ của bạn vào đây
    // Ví dụ: sourceLibrary: string;
}

export const IssuedDocuments: React.FunctionComponent<IIssuedDocumentsProps> = (props) => {
    // Demo data - Bạn sẽ thay thế phần này bằng code fetch dữ liệu từ WebPart cũ
    const [items, setItems] = React.useState([
        { fileName: 'Quyết định 01.pdf', modified: '2023-10-20', editor: 'Nguyễn Văn A' },
        { fileName: 'Thông báo nghỉ lễ.pdf', modified: '2023-10-22', editor: 'Trần Thị B' },
        { fileName: 'Báo cáo tài chính.xlsx', modified: '2023-10-25', editor: 'Lê Văn C' },
    ]);

    const columns: IColumn[] = [
        { key: 'icon', name: '', minWidth: 20, maxWidth: 20, onRender: () => <Icon iconName="Page" /> },
        { key: 'fileName', name: 'Tên văn bản', fieldName: 'fileName', minWidth: 200, maxWidth: 300, isResizable: true },
        { key: 'modified', name: 'Ngày sửa', fieldName: 'modified', minWidth: 100, maxWidth: 150 },
        { key: 'editor', name: 'Người sửa', fieldName: 'editor', minWidth: 150, maxWidth: 200 },
    ];

    return (
        <div style={{ padding: 20, background: 'white', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginTop: 0, color: '#003399', borderBottom: '1px solid #eee', paddingBottom: 10 }}>
                <Icon iconName="Send" style={{ marginRight: 10 }} />
                Văn bản phát hành
            </h2>

            <div style={{ marginBottom: 20 }}>
                <TextField placeholder="Tìm kiếm văn bản..." iconProps={{ iconName: 'Search' }} />
            </div>

            <DetailsList
                items={items}
                columns={columns}
                selectionMode={SelectionMode.none}
                compact={false}
            />

            {/* Hướng dẫn tích hợp */}
            <div style={{ marginTop: 30, padding: 15, background: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', borderRadius: 4 }}>
                <strong>Vùng tích hợp code cũ:</strong>
                <p>Bạn hãy copy logic (State, Effect, UI) từ WebPart cũ vào file <code>IssuedDocuments.tsx</code> này nhé.</p>
            </div>
        </div>
    );
};
