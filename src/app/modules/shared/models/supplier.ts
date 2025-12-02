import { Timestamp } from '@angular/fire/firestore';

export class Supplier {
  constructor(
    public supp_id: string,
    public supp_full_name: string,
    public supp_phone: string,
    public supp_identification_document: string,
    public supp_total_to_pay: number,
    public is_active: boolean,
    public created_by: string,
    public created_at: Timestamp,
    public updated_by: string,
    public updated_at: Timestamp
  ) {}
}
