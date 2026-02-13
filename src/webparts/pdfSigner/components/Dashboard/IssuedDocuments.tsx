import * as React from "react";
import { useState, useEffect } from "react";
import styles from "./IssuedDocuments.module.scss";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFile, FaFolder, FaChevronDown, FaChevronRight, FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaEye, FaTimes, FaUser, FaCalendarAlt, FaShieldAlt, FaTag, FaCodeBranch } from "react-icons/fa";
import { IFileInfo, IFolderInfo } from "@pnp/sp/presets/all";
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { SPFI } from '@pnp/sp';

export interface IIssuedDocumentsProps {
    sp: SPFI;
    context: WebPartContext;
    libraryName?: string;
    siteUrl?: string; // Optional, can default
}

// Interface mở rộng cho file info
interface IFileInfoExtended extends IFileInfo {
    ListItemAllFields?: {
        TomTatVanban?: string | undefined;
        EncodedAbsUrl?: string | undefined;
        LienHe?: string | undefined;
        HieuLucTu?: string | undefined;
        IndexItemID?: string | undefined;
        Tag?: string | undefined;
        Version?: string | undefined;
        M_x00e3_v_x0103_nb_x1ea3_n?: string | undefined;
        NgayPhatHanh?: string | undefined;
    };
}

// Interface cho thư mục
interface FolderItem {
    name: string;
    url: string;
    children?: FolderItem[];
    itemCount?: number | string;
    isOpen?: boolean;
}

// Interface cho file
interface FileItem {
    name: string;
    url: string;
    extension: string;
    modified?: string;
    views?: number;
    status?: string;
    MucDoNhayCam?: string | undefined;
    contactPerson?: string;
    effectiveDate?: string | undefined;
    Onwer?: string | undefined;
    LoaiVanBan?: string;
    MaVanBan?: string | undefined;
    effectiveVersion?: string | undefined;
}

// Định nghĩa icon cho các loại file
const fileIcons: Record<string, { icon: React.ReactElement; color: string }> = {
    pdf: { icon: <FaFilePdf />, color: "#e63946" },
    doc: { icon: <FaFileWord />, color: "#1e90ff" },
    docx: { icon: <FaFileWord />, color: "#1e90ff" },
    xls: { icon: <FaFileExcel />, color: "#2ecc71" },
    xlsx: { icon: <FaFileExcel />, color: "#2ecc71" },
    ppt: { icon: <FaFilePowerpoint />, color: "#f4a261" },
    pptx: { icon: <FaFilePowerpoint />, color: "#f4a261" },
    default: { icon: <FaFile />, color: "#6c757d" },
};

const ITEMS_PER_PAGE = 200;

export const IssuedDocuments: React.FC<IIssuedDocumentsProps> = ({
    libraryName = "VANBAN", // Default fallback
    siteUrl = "https://tahospitalvn.sharepoint.com/sites/QuanLyVanBan",
    sp: spDefault,
    context,
    //   libraryExists: initialLibraryExists,
    //   timeWaiting = 500,
    //   SearchTreeFolder = false,
    //   params,
}) => {
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [foldersSearch, setFoldersSearch] = useState<FolderItem[]>([]);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
    const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [error, setError] = useState<string | null>(null);
    const [libraryExists, setLibraryExists] = useState<boolean | null>(null);
    const [currentFolders, setCurrentFolders] = useState<FolderItem[]>([]);
    const [folderHistory, setFolderHistory] = useState<FolderItem[][]>([]);
    const [fileHistory, setFileHistory] = useState<FileItem[][]>([]);
    const [selectedLibrary, setSelectedLibrary] = useState<string>(libraryName);
    const [urlHyper, setUrlHyper] = useState<string>("");
    const [nameHyper, setNameHyper] = useState<string>("");
    const isLocalEnvironment = context?.pageContext.web.absoluteUrl.includes("localhost") || context?.pageContext.web.absoluteUrl.includes("workbench");
    const SearchTreeFolder = false; // Default setting

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    // Tích hợp hyperlink vào array (data là object với library, urlHyper, nameHyper)
    const libraryOptions: IDropdownOption[] = [
        {
            key: 'Tân Bình',
            text: 'Tân Bình',
            data: {
                library: 'VANBAN',
                urlHyper: "https://tahospitalvn-my.sharepoint.com/:x:/g/personal/qlcl_tahospital_vn/EQovondBksxAmCy_284jx8wBjxxgyoPHlqVeNf38Up78MQ",
                nameHyper: "BỘ QNA_BVĐK TÂM ANH TP.HCM"
            }
        },
        {
            key: 'Quận 8',
            text: 'Quận 8',
            data: {
                library: 'VANBAN_QUAN8',
                urlHyper: "https://tahospitalvn-my.sharepoint.com/:x:/g/personal/qlcl_tahospital_vn/EW1qoFmHKlVIlt9bFYVuqMEB5VeAZSLBy6CWCkixbd9BHQ?e=ZziCGa",
                nameHyper: "BỘ QNA_BVĐK TÂM ANH Q8"
            }
        },
        {
            key: 'Tamri',
            text: 'Tamri',
            data: {
                library: 'VANBAN_TAMRI',
                urlHyper: "https://tahospitalvn-my.sharepoint.com/:x:/g/personal/qlcl_tahospital_vn/ETpuKpgeIrRFpCUIX6bAUHQBAMDMD7XHdv46uwQeslBnew?e=i5IlOf",
                nameHyper: "BỘ QNA_TAMRI"
            }
        },
        {
            key: 'PK Quận 7',
            text: 'PK Quận 7',
            data: {
                library: 'VANBAN_PKQUAN7',
                urlHyper: "https://tahospitalvn-my.sharepoint.com/:x:/g/personal/qlcl_tahospital_vn/IQC7wVU6E4fXSJt9FHoDf8l2AdJJvck85MRI4tZ2XNrGJDI?e=pNczg3",
                nameHyper: "BỘ QNA_PK ĐA KHOA TÂM ANH QUẬN 7"
            }
        },
    ];

    const getServerRelativeUrl = (siteUrl: string, libName: string): string => {
        const url = new URL(siteUrl);
        return `${url.pathname}/${libName}`.replace(/\/+$/, "");
    };

    const getBaseUrl = (): string => {
        const effectiveSiteUrl = isValidUrl(siteUrl) ? siteUrl : "https://tahospitalvn.sharepoint.com/sites/QuanLyVanBan";
        return new URL(effectiveSiteUrl).origin;
    };

    // Trong hàm getFileDirectUrl
    const getFileDirectUrl = async (serverRelativeUrl: string, fileName: string): Promise<string | null> => {
        try {
            const file: IFileInfo & { ListItemAllFields?: { Id?: number; UniqueId?: string } } = await spDefault.web
                .getFileByServerRelativePath(serverRelativeUrl)
                .expand("ListItemAllFields")
                .select("ServerRelativeUrl, LinkingUrl, ListItemAllFields/Id, ListItemAllFields/UniqueId")();

            const baseUrl = getBaseUrl();
            let fileUrl = file.LinkingUrl;

            if (!fileUrl || !fileUrl.startsWith("http")) {
                fileUrl = `${baseUrl}${file.ServerRelativeUrl}`;
            }

            // Loại bỏ logic đặc biệt cho PDF, dùng URL trực tiếp
            return fileUrl;
        } catch (error) {
            console.error("Error fetching direct URL:", error);
            return null;
        }
    };

    const checkFileAccess = async (fileUrl: string): Promise<boolean> => {
        try {
            const response = await fetch(fileUrl, { method: "HEAD", credentials: "include" });
            return response.ok;
        } catch (error) {
            console.error("Error checking file access:", error);
            return false;
        }
    };

    const checkLibraryExists = async (libName: string, siteUrl: string): Promise<boolean> => {
        if (!spDefault) {
            console.error("SP context chưa được khởi tạo. Vui lòng kiểm tra cấu hình SPFx.");
            return false;
        }
        if (!isValidUrl(siteUrl)) {
            console.error(`URL không hợp lệ: ${siteUrl}. Sử dụng URL mặc định.`);
            return false;
        }
        try {
            const serverRelativeUrl = getServerRelativeUrl(siteUrl, libName);
            await spDefault.web.getFolderByServerRelativePath(serverRelativeUrl).select("Exists")();
            return true;
        } catch (error) {
            console.warn(`Thư viện '${libName}' không tồn tại tại '${siteUrl}':`, error);
            return false;
        }
    };

    const sortFolders = (folders: FolderItem[]): FolderItem[] => {
        return folders.sort((a, b) => {
            const numA = parseInt(a.name.match(/^\d+/)?.[0] || "9999");
            const numB = parseInt(b.name.match(/^\d+/)?.[0] || "9999");
            return numA === numB ? a.name.localeCompare(b.name) : numA - numB;
        });
    };

    const sortFiles = (files: FileItem[]): FileItem[] => {
        return files.sort((a, b) =>
            sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
    };

    const getFolders = async (folderUrl: string): Promise<FolderItem[]> => {
        try {
            const folderData: IFolderInfo[] = await spDefault.web.getFolderByServerRelativePath(folderUrl).folders();
            const formattedFolders = folderData
                .filter((folder) => folder.Name?.toLowerCase() !== "forms")
                .map((folder) => ({
                    name: folder.Name || "",
                    url: folder.ServerRelativeUrl,
                    children: [],
                    itemCount: folder.ItemCount === 0 ? "" : folder.ItemCount,
                    isOpen: false,
                }));
            return sortFolders(formattedFolders);
        } catch (error) {
            setError(`Không thể tải danh sách thư mục: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
            return [];
        }
    };

    const getFilesInFolder = async (folderUrl: string, page: number): Promise<void> => {
        if (!spDefault) return;
        try {
            const fileData: IFileInfoExtended[] = await spDefault.web
                .getFolderByServerRelativePath(folderUrl)
                .files
                .expand("ListItemAllFields")
                .select(
                    "Name, ServerRelativeUrl, TimeLastModified, ListItemAllFields/TomTatVanban, ListItemAllFields/IndexItemID, ListItemAllFields/NgayPhatHanh, ListItemAllFields/HieuLucTu, ListItemAllFields/Tag, ListItemAllFields/Version, ListItemAllFields/M_x00e3_v_x0103_nb_x1ea3_n, ListItemAllFields/EncodedAbsUrl"
                )
                .top(ITEMS_PER_PAGE)
                .skip((page - 1) * ITEMS_PER_PAGE)();

            const fileItems = fileData.map((file) => {
                const url = file.ServerRelativeUrl || "";
                return {
                    name: file.Name || "",
                    url,
                    extension: (file.Name?.split(".").pop() || "").toLowerCase() || "default",
                    modified: file.TimeLastModified,
                    views: Math.floor(Math.random() * 1000),
                    status: "Hiệu lực",
                    MucDoNhayCam: file.ListItemAllFields?.TomTatVanban || "Không xác định",
                    contactPerson: file.ListItemAllFields?.LienHe || "IDMS",
                    effectiveDate: file.ListItemAllFields?.HieuLucTu || "Chưa xác định",
                    Onwer: file.ListItemAllFields?.IndexItemID || "Không xác định",
                    MaVanBan: file.ListItemAllFields?.M_x00e3_v_x0103_nb_x1ea3_n || "IDMS",
                    LoaiVanBan: file.ListItemAllFields?.Tag || "Chưa xác định",
                    effectiveVersion: file.ListItemAllFields?.Version || "Chưa xác định",
                };
            });
            setFiles(sortFiles(fileItems));
        } catch (error) {
            setError(`Không thể tải danh sách tài liệu: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
            setFiles([]);
        }
    };

    const updateFolderChildren = (folderList: FolderItem[], targetUrl: string, newChildren: FolderItem[]): FolderItem[] => {
        return folderList.map((folder) => {
            if (folder.url === targetUrl) return { ...folder, children: newChildren, isOpen: true };
            if (folder.children && folder.children.length > 0) {
                return { ...folder, children: updateFolderChildren(folder.children, targetUrl, newChildren) };
            }
            return folder;
        });
    };

    const handleToggleFolder = async (folder: FolderItem): Promise<void> => {
        const isOpen = openFolders[folder.url] ?? false;
        setSelectedFolder(folder.url);
        setCurrentPage(1);

        if (!isOpen && folder.itemCount && (!folder.children || folder.children.length === 0)) {
            const subFolders = await getFolders(folder.url);
            setFolders((prevFolders) => updateFolderChildren(prevFolders, folder.url, subFolders));
        }

        setOpenFolders((prev) => ({ ...prev, [folder.url]: !isOpen }));
        await getFilesInFolder(folder.url, currentPage);
    };

    const searchFolderByName = async (nodes: FolderItem[], keyword: string): Promise<FolderItem[]> => {
        const lowerKeyword = keyword?.toLowerCase();
        const results: FolderItem[] = [];

        async function searchNode(node: FolderItem): Promise<FolderItem> {
            let updatedNode = { ...node };

            if (updatedNode.name?.toLowerCase().includes(lowerKeyword)) {
                results.push(updatedNode);
            }

            if (updatedNode.children && updatedNode.children.length > 0) {
                const updatedChildren = await Promise.all(
                    updatedNode.children.map((child) => searchNode(child))
                );
                updatedNode = { ...updatedNode, children: updatedChildren };
            }

            return updatedNode;
        }

        const updatedNodes = await Promise.all(nodes.map((node) => searchNode(node)));

        setFolders((prevFolders) => {
            if (JSON.stringify(prevFolders) !== JSON.stringify(updatedNodes)) {
                return updatedNodes;
            }
            return prevFolders;
        });

        return results;
    };

    const handleSearch = async (term: string): Promise<void> => {
        if (!spDefault) return;
        setIsLoading(true);

        if (SearchTreeFolder) {
            setFileHistory([]);
            setFolderHistory([]);
            setFiles([]);
            setOpenFolders({});
            setSelectedFolder(null);
            setFoldersSearch([]);
        }

        try {
            const libraryPath = getServerRelativeUrl(siteUrl, selectedLibrary);

            if (!term.trim()) {
                const rootFolders = await getFolders(libraryPath);
                setFolders(rootFolders.map((f) => ({ ...f, isOpen: false })));
                return;
            }

            const searchTermLower = term.trim().toLowerCase();

            if (!isLocalEnvironment) {
                const exists = await checkLibraryExists(selectedLibrary, siteUrl);
                setLibraryExists(exists);
                if (!exists) {
                    setError(`Thư viện '${selectedLibrary}' không tồn tại tại '${siteUrl}'. Vui lòng tạo thư viện này.`);
                    return;
                }
            }

            const allFolders = await getFolders(libraryPath);
            if (allFolders.length === 0) {
                console.warn("No folders loaded, proceeding with file search only.");
                // Tiếp tục với file search nếu folder thất bại
            }

            if (SearchTreeFolder) {
                const filteredFolders = await searchFolderByName(allFolders, searchTermLower);
                setFoldersSearch(filteredFolders);
                setFolders(allFolders);
            }

            const camlQuery = `
        <View Scope='RecursiveAll'>
          <Query>
            <Where>
              <Eq><FieldRef Name='FSObjType' /><Value Type='Integer'>0</Value></Eq>
            </Where>
          </Query>
          <ViewFields>
            <FieldRef Name='FileRef' />
            <FieldRef Name='FileLeafRef' />
            <FieldRef Name='FSObjType' />
            <FieldRef Name='Title' />
            <FieldRef Name='TomTatVanban' />
          </ViewFields>
          <RowLimit>500</RowLimit> <!-- Giảm giới hạn xuống 500 -->
        </View>
      `;

            const fileResults = await spDefault.web.lists
                .getByTitle(selectedLibrary)
                .renderListDataAsStream({ ViewXml: camlQuery });

            const filesData = (fileResults.Row as any[])
                .filter((item) => item.FileLeafRef?.toLowerCase().includes(searchTermLower) || item.TomTatVanban?.toLowerCase().includes(searchTermLower))
                .map((item) => {
                    const url = item.FileRef;
                    return {
                        name: item.FileLeafRef || "",
                        url,
                        extension: (item.FileLeafRef?.split(".").pop() || "").toLowerCase() || "default",
                        modified: item.Modified,
                        views: Math.floor(Math.random() * 1000),
                        status: "Hiệu lực",
                        MucDoNhayCam: item.ListItemAllFields?.TomTatVanban || "Không xác định",
                        contactPerson: item.ListItemAllFields?.LienHe || "IDMS",
                        effectiveDate: item.ListItemAllFields?.HieuLucTu || "Chưa xác định",
                        Onwer: item.ListItemAllFields?.IndexItemID || "Không xác định",
                        MaVanBan: item.ListItemAllFields?.M_x00e3_v_x0103_nb_x1ea3_n || "IDMS",
                        LoaiVanBan: item.ListItemAllFields?.Tag || "Chưa xác định",
                        effectiveVersion: item.ListItemAllFields?.Version || "Chưa xác định",
                    };
                });

            const matchedFolderPaths = new Set<string>();
            let selectedFolderPath: string | null = null;

            filesData.forEach((file) => {
                const filePath = file.url;
                const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
                let currentPath = "";
                const segments = folderPath.split("/").filter(Boolean);
                for (let i = 0; i < segments.length; i++) {
                    currentPath = `/${segments.slice(0, i + 1).join("/")}`;
                    if (currentPath.startsWith(`/${selectedLibrary}`)) {
                        matchedFolderPaths.add(currentPath);
                    }
                }
                if (!selectedFolderPath || folderPath.length > selectedFolderPath.length) {
                    selectedFolderPath = folderPath;
                }
            });

            const markAndOpenFolders = async (folders: FolderItem[], paths: Set<string>): Promise<FolderItem[]> => {
                return await Promise.all(
                    folders.map(async (folder) => {
                        const isMatched = paths.has(folder.url);
                        let children = folder.children || [];
                        if (isMatched && folder.itemCount && children.length === 0) {
                            children = await getFolders(folder.url);
                        }
                        if (children.length > 0) {
                            children = await markAndOpenFolders(children, paths);
                        }
                        return {
                            ...folder,
                            children,
                            isOpen: paths.has(folder.url),
                        };
                    })
                );
            };

            const updatedFolders = await markAndOpenFolders(allFolders, matchedFolderPaths);

            const newOpenFolders: { [key: string]: boolean } = {};
            matchedFolderPaths.forEach((path: string) => {
                newOpenFolders[path] = true;
            });

            if (filesData.length > 0 || (SearchTreeFolder && foldersSearch.length > 0)) {
                setFolders(sortFolders(updatedFolders));
                setFiles(sortFiles(filesData));
                setSelectedFolder(selectedFolderPath);
                setOpenFolders(newOpenFolders);
            } else {
                setFolders(allFolders);
            }
            setError(null);
        } catch (error) {
            setError(`Không thể tìm kiếm: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenFolder = async (folder: FolderItem): Promise<void> => {
        setIsLoading(true);
        setSelectedFolder(folder.url);
        setCurrentPage(1);

        setFolderHistory([...folderHistory, currentFolders]);
        setFileHistory([...fileHistory, files]);

        try {
            const subFolders = await getFolders(folder.url);
            setFolders((prevFolders) => updateFolderChildren(prevFolders, folder.url, subFolders));
            setCurrentFolders(subFolders);

            await getFilesInFolder(folder.url, 1);
        } catch (error) {
            setError(`Không thể mở thư mục: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
            setCurrentFolders([]);
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = (): void => {
        if (folderHistory.length > 0 && fileHistory.length > 0) {
            const previousFolders = folderHistory[folderHistory.length - 1];
            const previousFiles = fileHistory[fileHistory.length - 1];

            setCurrentFolders(previousFolders);
            setFiles(previousFiles);
            setFolderHistory(folderHistory.slice(0, -1));
            setFileHistory(fileHistory.slice(0, -1));

            const parentFolderUrl = previousFolders.length > 0
                ? previousFolders[0].url.split("/").slice(0, -1).join("/")
                : null;
            setSelectedFolder(parentFolderUrl);

            setOpenFolders((prev) => {
                const newOpenFolders = { ...prev };
                if (parentFolderUrl) {
                    newOpenFolders[parentFolderUrl] = true;
                }
                return newOpenFolders;
            });
        } else {
            setCurrentFolders(folders);
            setFiles([]);
            setSelectedFolder(null);
            setOpenFolders({});
        }
    };

    const handleSort = (): void => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        setFiles((prevFiles) => sortFiles([...prevFiles]));
    };
    const handleLibraryChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void => {
        if (option && option.data) {
            const { library, urlHyper, nameHyper } = option.data; // Lấy trực tiếp từ data object
            setSelectedLibrary(library);
            setUrlHyper(urlHyper);
            setNameHyper(nameHyper);
            setFolders([]); // Reset data
            setFiles([]);
            setError(null);
            setIsLoading(true); // Bắt đầu loading, useEffect sẽ load data và set false
            // Không gọi loadInitialData ở đây, để useEffect xử lý
            if (searchTerm) {
                handleSearch(searchTerm).catch((err) => console.error(err));
            }
        }
    };
    // Trong hàm handleOpenFile
    const handleOpenFile = async (url: string, extension: string, fileName: string): Promise<void> => {
        if (url) {
            const directUrl = await getFileDirectUrl(url, fileName);
            if (!directUrl) {
                console.error("Invalid file URL:", url);
                return;
            }

            const canAccess = await checkFileAccess(directUrl);
            if (!canAccess) {
                console.error("Access denied for file:", directUrl);
                alert("Bạn không có quyền truy cập file này. Vui lòng liên hệ quản trị viên.");
                return;
            }

            // Mở file trực tiếp qua window.open, không phân biệt PDF/Word/Excel
            window.open(directUrl, "_blank", "noopener,noreferrer");
        }
    };

    const paginatedFiles = files.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);

    const renderFolderTree = (folderList: FolderItem[]): JSX.Element => {
        return (
            <>
                {folderList.map((folder) => (
                    <div key={folder.url} className={styles.folderWrapper}>
                        <div
                            className={`${styles.folderItem} ${selectedFolder === folder.url ? styles.selected : ""}`}
                            onClick={() => handleToggleFolder(folder)}
                        >
                            <div className={styles.folderContent}>
                                <FaFolder className={styles.folderIcon} />
                                <span className={styles.folderName}>{folder.name}</span>
                            </div>
                            {typeof folder.itemCount === "number" && folder.itemCount > 0 && (
                                <span className={styles.chevron}>
                                    {openFolders[folder.url] ? <FaChevronDown /> : <FaChevronRight />}
                                </span>
                            )}
                        </div>
                        {openFolders[folder.url] && folder.children && folder.children.length > 0 && (
                            <div className={styles.subFolderList}>{renderFolderTree(folder.children)}</div>
                        )}
                    </div>
                ))}
            </>
        );
    };

    const loadInitialData = async (): Promise<void> => {
        try {
            const effectiveSiteUrl = isValidUrl(siteUrl) ? siteUrl : "https://tahospitalvn.sharepoint.com/sites/QuanLyVanBan";
            const libraryPath = getServerRelativeUrl(effectiveSiteUrl, selectedLibrary);
            //   if (!isLocalEnvironment && initialLibraryExists instanceof Promise) {
            //     const exists = await initialLibraryExists;
            //     setLibraryExists(exists);
            //     if (!exists) {
            //       setError(`Thư viện '${selectedLibrary}' không tồn tại tại '${effectiveSiteUrl}'. Vui lòng tạo thư viện này.`);
            //       setFolders([]);
            //       return;
            //     }
            //   } else if (!isLocalEnvironment && typeof initialLibraryExists === "boolean") {
            //     setLibraryExists(initialLibraryExists);
            //     if (!initialLibraryExists) {
            //       setError(`Thư viện '${selectedLibrary}' không tồn tại tại '${effectiveSiteUrl}'. Vui lòng tạo thư viện này.`);
            //       setFolders([]);
            //       return;
            //     }
            //   }
            // Simplified: Just try to get folders.
            const rootFolders = await getFolders(libraryPath);
            setFolders(rootFolders.map((f) => ({ ...f, isOpen: false })));
        } catch (error) {
            setError(`Không thể tải dữ liệu ban đầu: ${error instanceof Error ? error.message : "Lỗi không xác định"}`);
        }
    };

    useEffect(() => {
        // Tìm option default dựa trên libraryName
        const defaultOption = libraryOptions.find(opt => opt.data.library === libraryName);
        if (defaultOption) {
            setSelectedLibrary(defaultOption.data.library);
            setUrlHyper(defaultOption.data.urlHyper);
            setNameHyper(defaultOption.data.nameHyper);
        }
    }, []); // Chỉ chạy một lần để set default

    useEffect(() => {
        setIsLoading(true);
        loadInitialData().catch((err) => console.error("Error in useEffect:", err)).finally(() => setIsLoading(false));
    }, [selectedLibrary]); // Trigger load khi selectedLibrary thay đổi

    //   useEffect(() => {
    //     if (params) {
    //       setSearchTerm(params);
    //       handleSearch(params).catch((err) => console.error(err));
    //     }
    //   }, [params]);

    useEffect(() => {
        setCurrentFolders(foldersSearch);
    }, [foldersSearch]);

    if (error) return <div className={styles.errorMessage}>Lỗi: {error}</div>;

    return (
        <div className={styles.container}>
            <div className={styles.libraryRow}>
                <div className={styles.librarySelector}>
                    <Dropdown
                        label="Chọn thư viện"
                        selectedKey={libraryOptions.find(opt => opt.data.library === selectedLibrary)?.key}
                        onChange={handleLibraryChange}
                        options={libraryOptions}
                        styles={{ dropdown: { width: 200 } }}
                        disabled={isLoading}
                    />
                </div>
                <a
                    href={urlHyper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.hyperLink}
                >
                    {nameHyper}
                </a>
                {isLoading && <div className={styles.dropdownLoading}>Đang tải...</div>}
            </div>
            <div className={styles.searchContainer}>
                <FaSearch className={styles.searchIcon} />
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        placeholder="Tìm kiếm thư mục, tài liệu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        disabled={isLoading}
                    />
                    {!isLoading && searchTerm && (
                        <FaTimes
                            className={styles.clearIcon}
                            onClick={() => {
                                setSearchTerm("");
                                // handleSearch("").catch((err) => console.error("Clear search error:", err));
                            }}
                        />
                    )}
                </div>
                <button
                    className={styles.searchButton}
                    onClick={() => handleSearch(searchTerm).catch((err) => console.error("Search error:", err))}
                    disabled={isLoading || !searchTerm.trim()}
                >
                    Tìm kiếm
                </button>
                {isLoading && (
                    <div className={styles.loadingSpinner}>
                        <div className={styles.spinner}></div>
                    </div>
                )}
            </div>
            <div className={styles.contentBody}>
                {!(searchTerm.length > 0 && SearchTreeFolder) ? (
                    <div className={styles.contentBodyInner}>
                        <div className={styles.sidebar}>
                            <h3 className={styles.folderHeader}>
                                <FaFolder className={styles.folderIcon} />
                                Danh sách thư mục
                            </h3>
                            {libraryExists === false && (
                                <p className={styles.errorMessage}>
                                    ⚠️ Thư viện `{selectedLibrary}` không tồn tại. Vui lòng tạo thư viện tại {siteUrl}.
                                </p>
                            )}
                            {folders.length === 0 ? (
                                <p>
                                    {searchTerm ? "📁 Không tìm thấy thư mục phù hợp." : "📁 Không có thư mục nào trong thư viện."}
                                </p>
                            ) : (
                                <div className={styles.folderList}>{renderFolderTree(folders)}</div>
                            )}
                        </div>
                        <div className={styles.fileList}>
                            <div className={styles.fileHeader}>
                                <h3>📄 Tài liệu ({files.length})</h3>
                                <button onClick={handleSort} className={styles.sortButton} disabled={isLoading}>
                                    {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
                                </button>
                            </div>
                            {selectedFolder || (searchTerm && files.length > 0) ? (
                                paginatedFiles.length > 0 ? (
                                    paginatedFiles.map((file) => (
                                        <div key={file.url} className={styles.documentItem} onClick={() => handleOpenFile(file.url, file.extension, file.name)}>
                                            <div className={styles.fileHeader}>
                                                <div className={styles.fileType}>
                                                    {React.cloneElement(fileIcons[file.extension]?.icon || <FaFile />, {
                                                        style: { color: fileIcons[file.extension]?.color || fileIcons.default.color },
                                                    })}
                                                </div>
                                                <div className={styles.fileTitle}>
                                                    <div className={styles.fileTitleRow}>
                                                        <span className={styles.fileName}>{file.name}</span>
                                                        {file.status && <span className={styles.status}>{file.status}</span>}
                                                    </div>
                                                    {file.views && (
                                                        <span className={styles.views}>
                                                            <FaEye /> {file.views} lượt xem
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className={styles.fileMeta}>
                                                {file.contactPerson && (
                                                    <div className={styles.metaItem}>
                                                        <FaUser className={styles.metaIcon} />
                                                        <span>
                                                            <strong>Người liên hệ:</strong> {file.contactPerson}
                                                        </span>
                                                    </div>
                                                )}
                                                {file.effectiveDate && (
                                                    <div className={styles.metaItem}>
                                                        <FaCalendarAlt className={styles.metaIcon} />
                                                        <span>
                                                            <strong>Ngày hiệu lực:</strong> {new Date(file.effectiveDate).toLocaleDateString("vi-VN")}
                                                        </span>
                                                    </div>
                                                )}
                                                {file.MucDoNhayCam && (
                                                    <div className={styles.metaItem}>
                                                        <FaShieldAlt className={styles.metaIcon} />
                                                        <span>
                                                            <strong>Mức độ nhạy cảm:</strong> {file.MucDoNhayCam}
                                                        </span>
                                                    </div>
                                                )}
                                                {file.MaVanBan && (
                                                    <div className={styles.metaItem}>
                                                        <FaTag className={styles.metaIcon} />
                                                        <span>
                                                            <strong>Mã văn bản:</strong> {file.MaVanBan}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>Không có tài liệu nào trong thư mục này.</div>
                                )
                            ) : (
                                <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                    {searchTerm ? "Không có kết quả tìm kiếm." : "Chọn một thư mục để xem tài liệu."}
                                </div>
                            )}
                            {totalPages > 1 && (
                                <div className={styles.pagination}>
                                    <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                        &lt;
                                    </button>
                                    <span>
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>Search Tree Folder View (Not active)</div>
                )}
            </div>
        </div>
    );
};
