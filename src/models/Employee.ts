import { RowDataPacket } from 'mysql2';

export interface Employee extends RowDataPacket {
    id?: number;
    name: string;
    department_id: number;
    title: string;
    email: string;
    status: 'active' | 'inactive' | 'terminated';
    created_at?: Date;
}