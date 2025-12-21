// Helper functions for Claims Management
// Extracted from ClaimsManagement.tsx for reusability

import { formatVN } from '@/utils/dateUtils';

/**
 * Get property from object with multiple possible key names
 * Handles both camelCase and PascalCase API responses
 */
export const getProp = (obj: any, keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
        if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
};

/**
 * Extract image URLs from an item (handles various API response formats)
 */
export const getItemImages = (item: any): string[] => {
    if (!item) return [];
    const urls = getProp(item, ['imageUrls', 'ImageUrls']);
    if (Array.isArray(urls) && urls.length > 0) return urls;
    const singleUrl = getProp(item, ['imageUrl', 'ImageUrl', 'thumbnail', 'Thumbnail']);
    if (typeof singleUrl === 'string' && singleUrl) return [singleUrl];
    return [];
};

/**
 * Get item title with fallback
 */
export const getItemTitle = (item: any) => getProp(item, ['title', 'Title']) || "N/A";

/**
 * Get item ID (works for both found and lost items)
 */
export const getItemId = (item: any) => getProp(item, ['foundItemId', 'FoundItemId', 'lostItemId', 'LostItemId', 'id', 'Id']);

/**
 * Get category name, with fallback to lookup from categories list
 */
export const getItemCategory = (item: any, categories?: any[]) => {
    const name = getProp(item, ['categoryName', 'CategoryName']);
    if (name) return name;
    const id = getProp(item, ['categoryId', 'CategoryId', 'categoryID', 'CategoryID']);
    if (id && categories) {
        const idNum = Number(id);
        const cat = categories.find(c => Number(getProp(c, ['categoryId', 'CategoryId'])) === idNum);
        return getProp(cat, ['categoryName', 'CategoryName']) || "N/A";
    }
    return "N/A";
};

/**
 * Get item location (works for both found and lost items)
 */
export const getItemLocation = (item: any) => getProp(item, ['foundLocation', 'FoundLocation', 'lostLocation', 'LostLocation']) || "N/A";

/**
 * Get item date (handles multiple date field names)
 */
export const getItemDate = (item: any) => getProp(item, ['foundDate', 'FoundDate', 'lostDate', 'LostDate', 'createdAt', 'CreatedAt', 'claimDate', 'ClaimDate']);

/**
 * Get campus name, with fallback to lookup from campuses list
 */
export const getItemCampus = (item: any, campuses?: any[]) => {
    const name = getProp(item, ['campusName', 'CampusName']);
    if (name) return name;
    const id = getProp(item, ['campusId', 'CampusId', 'campusID', 'CampusID']);
    if (id && campuses) {
        const idNum = Number(id);
        const camp = campuses.find(c => Number(getProp(c, ['campusId', 'CampusId'])) === idNum);
        return getProp(camp, ['campusName', 'CampusName']) || "N/A";
    }
    return "N/A";
};

/**
 * Get item description with fallback
 */
export const getItemDescription = (item: any) => getProp(item, ['description', 'Description']) || "N/A";

/**
 * Format date safely
 */
export const formatDate = (dateString: string | null | undefined, formatStr: string = "dd/MM/yyyy") => {
    if (!dateString) return "N/A";
    try {
        return formatVN(dateString, formatStr);
    } catch {
        return "N/A";
    }
};
