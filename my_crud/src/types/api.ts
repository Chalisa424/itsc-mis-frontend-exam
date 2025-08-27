export interface BlogApi{
    id: number;
    title: string;
    content: string;
    img_idl?: string | null;
    user_idl?: string | null;
    hit:number;
    pin: boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string
    Img?:{url:string} | null
    
}

export interface BlogListResponse{
    totalItems: number;
    rows: BlogApi[];
    totalPages:number;
    currentPage: number
}