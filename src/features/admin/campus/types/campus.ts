import type { Campus } from '@/types';

export interface CampusFormValues {
    campusName: string;
    address: string;
    storageLocation: string;
}

export type SortField = 'name' | 'id' | 'storage';
export type SortOrder = 'asc' | 'desc';

export interface CampusListProps {
    campuses: Campus[];
    isLoading: boolean;
    onEdit: (campus: Campus) => void;
    onDelete: (campus: Campus) => void;
}
