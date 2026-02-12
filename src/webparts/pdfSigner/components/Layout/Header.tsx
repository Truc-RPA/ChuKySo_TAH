import * as React from 'react';
import styles from './Header.module.scss';
import { Icon } from 'office-ui-fabric-react/lib/Icon';

export interface IHeaderProps {
    userDisplayName: string;
}

export const Header: React.FunctionComponent<IHeaderProps> = (props) => {
    return (
        <div className={styles.header}>
            <div style={{ width: 20 }}>
                <Icon iconName="GlobalNavButton" style={{ fontSize: 18, color: '#003399', cursor: 'pointer' }} />
            </div>

            <div className={styles.title}>Quản lý văn bản</div>

            <div className={styles.userInfo}>
                <span>{props.userDisplayName || 'Người dùng'}</span>
                <div style={{ marginLeft: 10 }}>
                    {/* Logo placeholder */}
                    <span style={{ color: '#003399', fontWeight: 'bold', fontSize: 20 }}>ta</span>
                </div>
                <div className={styles.logout}>Đăng xuất</div>
            </div>
        </div>
    );
};
