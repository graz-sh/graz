export type GetSnapsResponse = Record<string, Snap>;

export interface Snap {
  permissionName: string;
  id: string;
  version: string;
  initialPermissions: Record<string, unknown>;
}
