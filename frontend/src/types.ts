export interface Book {
  id: number;
  title: string;
  subject: string;
  condition: string;
  owner_id: string;
  owner_name?: string;
  claimed_by_id?: string;
  status: 'available' | 'claimed';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
}
