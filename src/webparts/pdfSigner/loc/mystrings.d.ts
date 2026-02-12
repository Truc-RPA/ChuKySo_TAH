declare interface IPdfSignerWebPartStrings {
    PropertyPaneDescription: string;
    BasicGroupName: string;
    SignatureLibraryNameLabel: string;
    ApprovalListNameLabel: string;
    SignedOutputLibraryLabel: string;
    SignatureWidthLabel: string;
    SignatureHeightLabel: string;
    AutoFillDateLabel: string;
    DateFormatLabel: string;
    AppLocalEnvironmentSharePoint: string;
    AppSharePointEnvironment: string;
    AppTeamsTabEnvironment: string;
}

declare module 'PdfSignerWebPartStrings' {
    const strings: IPdfSignerWebPartStrings;
    export = strings;
}
