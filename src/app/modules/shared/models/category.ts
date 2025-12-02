import { Timestamp } from '@angular/fire/firestore';

export interface Category {
  cat_id?: string;
  cat_name: string;

  is_active:boolean,
  created_by?: any,
  created_at?: Timestamp,
  updated_by?: any,
  updated_at?: Timestamp,
}
