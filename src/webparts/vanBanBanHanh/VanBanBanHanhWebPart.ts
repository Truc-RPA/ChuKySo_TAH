import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-webpart-base";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { SPFI, spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/items";
import ViewDocumentTree from "./components/VanBanBanHanh";
import { IViewDoc30DaysProps } from "./components/IViewDoc30DaysProps";
import { PropertyPaneToggle } from "@microsoft/sp-property-pane";

export interface IViewDoc30DaysWebPartProps {
  description: string;
  libraryName: string;
  siteUrl: string;
  timeWaiting: number;
  SearchTreeFolder: boolean;
}

export default class ViewDoc30DaysWebPart extends BaseClientSideWebPart<IViewDoc30DaysWebPartProps> {
  private sp: SPFI;
  private readonly defaultSiteUrl = "https://tahospitalvn.sharepoint.com/sites/QuanLyVanBan";

  protected async onInit(): Promise<void> {
    try {
      const effectiveSiteUrl = this.properties.siteUrl || this.defaultSiteUrl;
      if (!this.isValidUrl(effectiveSiteUrl)) {
        console.warn(`URL không hợp lệ, sử dụng URL mặc định: ${this.defaultSiteUrl}`);
        this.properties.siteUrl = this.defaultSiteUrl; // Gán URL mặc định
      }
      this.sp = spfi(effectiveSiteUrl).using(SPFx(this.context));
      console.log("SP instance initialized successfully with URL:", effectiveSiteUrl);

      // Không throw lỗi nếu thư viện không tồn tại, chỉ ghi log và để component xử lý
      if (!this.context.pageContext.web.absoluteUrl.includes("localhost") && !this.context.pageContext.web.absoluteUrl.includes("workbench")) {
        const libraryExists = await this.checkLibraryExists(
          this.properties.libraryName,
          effectiveSiteUrl
        );
        if (!libraryExists) {
          console.warn(`Thư viện '${this.properties.libraryName}' không tồn tại tại '${effectiveSiteUrl}'.`);
        }
      }
    } catch (error) {
      console.error("Error initializing SP instance:", error);
      // Không throw lỗi, để Web Part vẫn render
    }
    return Promise.resolve();
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url); 
      return !!parsedUrl; 
    } catch {
      return false;
    }
  }

  private async checkLibraryExists(libraryName: string, siteUrl: string): Promise<boolean> {
    try {
      const serverRelativeUrl = `${new URL(siteUrl).pathname}/${libraryName}`.replace(/\/+$/, "");
      console.log("Checking folder at:", serverRelativeUrl);
      const folder = await this.sp.web.getFolderByServerRelativePath(serverRelativeUrl).select("Exists")();
      return folder.Exists;
    } catch (error) {
      console.error("Error checking library:", error);
      return false;
    }
  }

  public render(): void {
    if (!this.sp) {
      this.domElement.innerHTML = `
        <div style="color: red; padding: 10px;">
          Lỗi: SPFI instance chưa được khởi tạo. Sử dụng URL mặc định: ${this.defaultSiteUrl}.
        </div>`;
      return;
    }

    const effectiveSiteUrl = this.properties.siteUrl || this.defaultSiteUrl;
    const urlParams = new URLSearchParams(window.location.search);
    const element: React.ReactElement<IViewDoc30DaysProps> = React.createElement(
      ViewDocumentTree,
      {
        sp: this.sp,
        libraryName: this.properties.libraryName,
        siteUrl: effectiveSiteUrl,
        context: this.context,
        timeWaiting: this.properties.timeWaiting,
        params:  urlParams.get('search') ?? "", // Lấy giá trị của param1,
        SearchTreeFolder: this.properties.SearchTreeFolder,
        libraryExists: !this.context.pageContext.web.absoluteUrl.includes("localhost") &&
          !this.context.pageContext.web.absoluteUrl.includes("workbench") &&
          this.checkLibraryExists(this.properties.libraryName , effectiveSiteUrl),
        },
    );
    ReactDOM.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: "Cấu hình Web Part",
          },
          groups: [
            {
              groupName: "Cài đặt",
              groupFields: [
                PropertyPaneTextField("description", {
                  label: "Mô tả",
                }),
                PropertyPaneTextField("siteUrl", {
                  label: "Site URL",
                  description: "Nhập URL đầy đủ của site (ví dụ: https://tahospitalvn.sharepoint.com/sites/QuanLyVanBan). Để trống để dùng URL mặc định.",
                  value: this.properties.siteUrl || this.defaultSiteUrl,
                }),
                PropertyPaneTextField("libraryName", {
                  label: "Tên thư viện tài liệu",
                  description: "Nhập tên thư viện tài liệu bạn muốn sử dụng.",
                  // value: this.properties.libraryName || this.defaultLibraryName,
                  value: this.properties.libraryName,
                  disabled: false,
                }),
                PropertyPaneTextField("timeWaiting", {
                  label: "Thời gian chờ (ms)",
                }),
                PropertyPaneToggle("SearchTreeFolder", { // Thêm biến SearchTreeFolder
                  label: "Không hiển thị tìm kiếm dạng cây thư mục",
                  onText: "Bật", // Văn bản khi bật
                  offText: "Tắt", // Văn bản khi tắt
                  checked: this.properties.SearchTreeFolder , 
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}