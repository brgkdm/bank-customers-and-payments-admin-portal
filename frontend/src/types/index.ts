// Customer types based on MusteriOkuDto
export interface Customer {
  musteriNo: number;
  ad: string; // First name
  soyad: string; // Last name
  telefon: string; // Phone
  sube: string; // Branch
  krediNotu: number; // Credit score
  cinsiyet: string; // Gender
  dogumTarihi: string; // Birth date
  kayitTarihi: string; // Registration date
  krediTutari: number; // Credit amount
}

// Customer DTO for create/update operations
export interface CustomerCreateUpdateDto {
  musteriNo?: number;
  ad: string;
  soyad: string;
  telefon: string;
  sube: string;
  krediNotu: number;
  cinsiyet: string;
  dogumTarihi: string;
  kayitTarihi?: string;
  krediTutari: number;
}

// Payment types based on Odemeler entity
export interface Payment {
  odemeId: number;
  musteriNo?: number;
  guncelOdemeTutari?: number; // Current payment amount
  guncelBorcTutari?: number; // Current debt amount
  sonOdemeTarihi?: string; // Last payment date
  gecikmisBorcTutari?: number; // Overdue debt amount
  odenmisBorcTutari?: number; // Paid debt amount
  musteri?: Customer; // Navigation property
}

// Payment DTO for create/update operations
export interface PaymentDto {
  odemeId?: number;
  musteriNo?: number;
  guncelOdemeTutari?: number;
  guncelBorcTutari?: number;
  sonOdemeTarihi?: string; // Will be converted from DateOnly
  gecikmisBorcTutari?: number;
  odenmisBorcTutari?: number;
}

// Search and filter types
export interface CustomerSearchParams {
  query?: string;
  sube?: string;
}

export interface PaymentFilterParams {
  musteriNo?: number;
  baslangicTarihi?: string;
  bitisTarihi?: string;
}