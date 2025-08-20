export interface Blog {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  published: boolean;
  createAt: string;
}

export interface BlogQuery {
  q?: string; //ค้นหาข้อความ
  titleOnly?: boolean; //ค้นหาเฉพาะหัวข้อ
  published?: "all" | "on" | "off";
  page?: number;
  pageSize?: number;
}
