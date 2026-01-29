import { RowDataPacket } from 'mysql2';

export interface Department extends RowDataPacket {
    id?: number;        
    code: string;
    name: string;
    created_at?: Date;
}