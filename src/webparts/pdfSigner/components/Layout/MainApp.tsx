import * as React from 'react';
import styles from './MainApp.module.scss';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { WelcomeScreen } from '../Dashboard/WelcomeScreen';
import { IssuedDocuments } from '../Dashboard/IssuedDocuments';
import PdfSignerComponent from '../PdfSignerComponent';
import { IPdfSignerProps } from '../IPdfSignerProps';

export interface IMainAppProps extends IPdfSignerProps {
    userDisplayName: string;
    menuUrls?: { [key: string]: string };
}

export const MainApp: React.FunctionComponent<IMainAppProps> = (props) => {
    const [currentView, setCurrentView] = React.useState('home');

    const renderContent = () => {
        switch (currentView) {
            case 'home':
                return <WelcomeScreen userDisplayName={props.userDisplayName} />;
            case 'signature':
                return <PdfSignerComponent {...props} />;
            case 'phathanh':
                return <IssuedDocuments sp={props.sp} context={props.context} />;
            default:
                // For other menu items, show a placeholder or the Welcome Screen for now
                return <WelcomeScreen userDisplayName={props.userDisplayName} />;
        }
    };

    return (
        <div className={styles.mainApp}>
            <Sidebar currentView={currentView} onNavigate={setCurrentView} menuUrls={props.menuUrls} />
            <div className={styles.contentWrapper}>
                <Header userDisplayName={props.userDisplayName} />
                <div className={styles.mainContent}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};
