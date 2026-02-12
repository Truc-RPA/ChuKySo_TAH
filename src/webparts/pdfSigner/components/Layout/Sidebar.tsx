import * as React from 'react';
import styles from './Sidebar.module.scss';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface ISidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar: React.FunctionComponent<ISidebarProps> = (props) => {
    const menuItems = [
        { key: 'home', label: 'Trang chủ', icon: 'Home' },
        { key: 'quanly', label: 'Quản lý văn bản', icon: 'CloudWeather' },
        { key: 'phathanh', label: 'Văn bản phát hành', icon: 'Send' },
        { key: 'files', label: 'Danh sách file', icon: 'FolderOpen' },
        { key: 'signature', label: 'Chữ ký', icon: 'PenWorkspace' }, // This is our WebPart
    ];

    return (
        <div className={styles.sidebar}>
            {/* Logo Text simulation (since we don't have the image file) */}
            <div className={styles.logoArea}>
                <h1 className={styles.logoText}>ta</h1>
                <div className={styles.logoSub}>TâmAnhHospital</div>
            </div>

            <ul className={styles.menuList}>
                {/* Search simulation */}
                <li style={{ padding: '0 20px 20px 20px' }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: 4,
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <span style={{ color: '#aaa', fontSize: 13 }}>Tìm kiếm</span>
                        <Icon iconName="Search" style={{ marginLeft: 'auto', color: '#aaa' }} />
                    </div>
                </li>

                {menuItems.map(item => (
                    <li
                        key={item.key}
                        className={`${styles.menuItem} ${props.currentView === item.key ? styles.active : ''}`}
                        onClick={() => props.onNavigate(item.key)}
                    >
                        <Icon iconName={item.icon} className={styles.menuIcon} />
                        <span className={styles.menuText}>{item.label}</span>
                    </li>
                ))}
            </ul>

            <div className={styles.footer}>
                v1.0.0
            </div>
        </div>
    );
};
