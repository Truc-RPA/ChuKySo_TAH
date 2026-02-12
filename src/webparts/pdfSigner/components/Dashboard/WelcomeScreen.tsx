import * as React from 'react';
import styles from './WelcomeScreen.module.scss';

export interface IWelcomeScreenProps {
    userDisplayName: string;
}

export const WelcomeScreen: React.FunctionComponent<IWelcomeScreenProps> = (props) => {
    return (
        <div className={styles.welcomeScreen}>
            <div className={styles.card}>
                <h2>Xin chào</h2>
                <h3>{props.userDisplayName}</h3>
                <p>Chào mừng bạn đến với hệ thống quản lý văn bản</p>
            </div>
        </div>
    );
};
