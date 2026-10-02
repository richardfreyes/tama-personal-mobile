export type LegalDocumentScreenProps = {
  content: string;
  title: string;
};

export type LegalTableData = {
  headerCells: string[];
  rows: string[][];
  nextIndex: number;
};