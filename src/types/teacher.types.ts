export interface Teacher {
        id: number;
        firstName: string;
        lastName: string;
        login: string;
        phone: string;
        password: string;
        role: string;
        salary: number | null;
        commissionPercentage: number | null;
        createdAt: string;
}
