import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    type IPropertyPaneConfiguration,
    PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'PdfSignerWebPartStrings';
import { MainApp, IMainAppProps } from './components/Layout/MainApp';

// PnPjs imports
import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/presets/all";

export interface IPdfSignerWebPartProps {
    signatureLibraryName: string;
    approvalListName: string;
    signedOutputLibrary: string;
    signatureWidth: number;
    signatureHeight: number;
    autoFillDate: boolean;
    dateFormat: string;
}

export default class PdfSignerWebPart extends BaseClientSideWebPart<IPdfSignerWebPartProps> {

    private _sp: any;

    public async onInit(): Promise<void> {
        await super.onInit();
        this._sp = spfi().using(SPFx(this.context));
    }

    public render(): void {
        const element: React.ReactElement<IMainAppProps> = React.createElement(
            MainApp,
            {
                sp: this._sp,
                hasContext: !!this.context,
                userDisplayName: this.context.pageContext.user.displayName,
                signatureLibraryName: this.properties.signatureLibraryName,
                approvalListName: this.properties.approvalListName,
                signedOutputLibrary: this.properties.signedOutputLibrary,
                signatureWidth: this.properties.signatureWidth,
                signatureHeight: this.properties.signatureHeight,
                autoFillDate: this.properties.autoFillDate,
                dateFormat: this.properties.dateFormat
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
        return {
            pages: [
                {
                    header: {
                        description: strings.PropertyPaneDescription
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                PropertyPaneTextField('signatureLibraryName', {
                                    label: strings.SignatureLibraryNameLabel
                                }),
                                PropertyPaneTextField('approvalListName', {
                                    label: strings.ApprovalListNameLabel
                                }),
                                PropertyPaneTextField('signedOutputLibrary', {
                                    label: strings.SignedOutputLibraryLabel
                                }),
                                PropertyPaneTextField('dateFormat', {
                                    label: strings.DateFormatLabel
                                })
                            ]
                        }
                    ]
                }
            ]
        };
    }
}
