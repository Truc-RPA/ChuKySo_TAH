/**
 * NameNormalizer.ts
 * Helper class để chuẩn hóa tên tiếng Việt, bỏ dấu, và so khớp tên.
 */

// Bảng mapping dấu tiếng Việt
const VIETNAMESE_DIACRITICS_MAP: { [key: string]: string } = {
    'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'đ': 'd',
    'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    // Uppercase variants
    'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
    'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
    'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
    'Đ': 'D',
    'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
    'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
    'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
    'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
    'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
    'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
    'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
    'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
    'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y'
};

export class NameNormalizer {

    /**
     * Bỏ dấu tiếng Việt khỏi chuỗi
     * @param str Chuỗi có dấu tiếng Việt
     * @returns Chuỗi không dấu
     */
    public static removeVietnameseDiacritics(str: string): string {
        if (!str) return '';

        let result = '';
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            result += VIETNAMESE_DIACRITICS_MAP[char] || char;
        }
        return result;
    }

    /**
     * Chuẩn hóa tên: lowercase + bỏ dấu + trim + bỏ khoảng trắng thừa
     * @param name Tên cần chuẩn hóa
     * @returns Tên đã chuẩn hóa
     */
    public static normalize(name: string): string {
        if (!name) return '';

        const noDiacritics = NameNormalizer.removeVietnameseDiacritics(name);
        return noDiacritics
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' '); // Gộp nhiều khoảng trắng thành 1
    }

    /**
     * So sánh 2 tên, không phân biệt hoa/thường và dấu tiếng Việt
     * @param name1 Tên thứ nhất
     * @param name2 Tên thứ hai
     * @returns true nếu trùng khớp
     */
    public static isMatch(name1: string, name2: string): boolean {
        if (!name1 || !name2) return false;
        return NameNormalizer.normalize(name1) === NameNormalizer.normalize(name2);
    }

    /**
     * Tạo tên file chữ ký theo quy ước: Signature_{FullName}.png
     * @param fullName Họ và tên
     * @returns Tên file chữ ký
     */
    public static toSignatureFileName(fullName: string): string {
        if (!fullName) return '';
        return `Signature_${fullName.trim()}.png`;
    }
}
