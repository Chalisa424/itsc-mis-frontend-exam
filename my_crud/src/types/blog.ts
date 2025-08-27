//จาก API: active
export interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;    
  published?: boolean;
  createdAt: string;
  updatedAt: string;
  hit: number
  pin: boolean
}

// ใช้กับการค้นหา/กรองในหน้า List 
export interface BlogQuery {
  page?: number;
  size?: number;
  q?: string; //ค้นหาข้อความ
  show?: 'all' | 'active'
}
