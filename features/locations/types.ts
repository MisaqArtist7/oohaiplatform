export interface City {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: City[];
}
