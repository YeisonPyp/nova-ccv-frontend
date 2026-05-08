export interface Agency {
  id: number;
  name: string;
  identification?: string;
  address?: string;
  nit?: string;
  legalRepresentative: string;
  companyType: string;
  vatResponsible: boolean;
}
