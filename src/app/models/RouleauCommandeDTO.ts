export interface RouleauCommandeDTO {
    id?: number;
    commandeId: number;
    rouleauId: number;
    poidsReserve: number;
    metrageReserve?: number;
    etat?: 'RESERVED' | 'CONSUMED' | 'CANCELED';
    dateAllocation?: string;
    dateConsommation?: string;
    dateAnnulation?: string;
  }