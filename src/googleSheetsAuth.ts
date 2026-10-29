import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Business } from './types';

export const DEFAULT_SPREADSHEET_ID = '1ob3o8P8o0hqMNiWWR2_WRXxlEXh8qPCgQ4HNqSufZ7w';

// Reuse existing Firebase app instance or initialize
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Add required Google Workspace scopes for Sheets and Drive
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize auth state listener
export const initGoogleSheetsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google to get access token for Google Sheets API
export const googleSignInForSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No se pudo obtener el token de acceso de Google Workspace');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setGoogleAccessTokenManually = (token: string) => {
  cachedAccessToken = token;
};

export const googleSheetsLogout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- GOOGLE SHEETS API V4 CLIENT HELPERS ---

export interface GoogleDriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export interface GoogleSheetTab {
  sheetId: number;
  title: string;
  index: number;
  rowCount?: number;
  columnCount?: number;
}

export interface GoogleSpreadsheetMetadata {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
  sheets: GoogleSheetTab[];
}

// 1. Fetch user's spreadsheets from Google Drive
export const fetchUserSpreadsheetsFromDrive = async (accessToken?: string): Promise<GoogleDriveSpreadsheet[]> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  const res = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.spreadsheet'&fields=files(id%2Cname%2CmodifiedTime%2CwebViewLink)&pageSize=25",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error en Google Drive API: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
};

// 2. Fetch metadata & sheets list of a specific Google Spreadsheet
export const fetchSpreadsheetMetadata = async (spreadsheetId: string, accessToken?: string): Promise<GoogleSpreadsheetMetadata> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=spreadsheetId,properties.title,spreadsheetUrl,sheets.properties`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error en Google Sheets API (${res.status}): ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return {
    spreadsheetId: data.spreadsheetId,
    title: data.properties?.title || 'Base de Datos Nexus Prime',
    spreadsheetUrl: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
      rowCount: s.properties.gridProperties?.rowCount,
      columnCount: s.properties.gridProperties?.columnCount,
    })),
  };
};

// Helper to ensure a sheet tab exists in the spreadsheet (creates it if missing)
export const ensureSheetTabExists = async (
  spreadsheetId: string,
  sheetTitle: string,
  accessToken?: string
): Promise<boolean> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  try {
    const meta = await fetchSpreadsheetMetadata(spreadsheetId, token);
    const exists = meta.sheets.some(s => s.title.toLowerCase() === sheetTitle.toLowerCase());
    if (!exists) {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              addSheet: {
                properties: {
                  title: sheetTitle,
                },
              },
            },
          ],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn(`No se pudo crear automáticamente la pestaña "${sheetTitle}":`, err);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error al verificar o crear la pestaña "${sheetTitle}":`, error);
    return false;
  }
};

// 3. Fetch row values from a sheet tab
export const fetchSheetRows = async (
  spreadsheetId: string,
  sheetTitle: string,
  accessToken?: string
): Promise<string[][]> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  const rangeStr = `'${sheetTitle}'!A1:Z1000`;
  const encodedRange = encodeURIComponent(rangeStr);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 400 || (err.error?.message && err.error.message.includes('Unable to parse range'))) {
      return [];
    }
    throw new Error(`Error al leer hoja "${sheetTitle}": ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.values || [];
};

// 4. Append a row to a sheet tab in Google Sheets
export const appendRowToGoogleSheet = async (
  spreadsheetId: string,
  sheetTitle: string,
  valuesRow: string[],
  accessToken?: string
): Promise<boolean> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  await ensureSheetTabExists(spreadsheetId, sheetTitle, token);

  const rangeStr = `'${sheetTitle}'!A1`;
  const encodedRange = encodeURIComponent(rangeStr);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetTitle}'!A1`,
        majorDimension: 'ROWS',
        values: [valuesRow],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error al insertar en Google Sheets: ${err.error?.message || res.statusText}`);
  }

  return true;
};

// Clear and overwrite entire sheet tab with new 2D array of rows
export const overwriteGoogleSheetTab = async (
  spreadsheetId: string,
  sheetTitle: string,
  allRows: string[][],
  accessToken?: string
): Promise<boolean> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  // Auto-create missing tab in the target Google Sheet if it does not exist yet
  await ensureSheetTabExists(spreadsheetId, sheetTitle, token);

  const rangeStr = `'${sheetTitle}'!A1`;
  const encodedRange = encodeURIComponent(rangeStr);

  // 1. Clear current values
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  ).catch(() => {});

  // 2. Write new rows starting from A1
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `'${sheetTitle}'!A1`,
        majorDimension: 'ROWS',
        values: allRows,
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error al actualizar hoja "${sheetTitle}" en Google Sheets: ${err.error?.message || res.statusText}`);
  }

  return true;
};

// 5. Create a brand new Nexus Prime Master Database spreadsheet in Google Sheets
export const createNexusPrimeMasterSheet = async (accessToken?: string): Promise<GoogleSpreadsheetMetadata> => {
  const token = accessToken || cachedAccessToken;
  if (!token) throw new Error('Se requiere un token de acceso de Google activo.');

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Nexus Prime - Base de Datos Master (Google Sheets)',
      },
      sheets: [
        { properties: { title: 'Usuarios' } },
        { properties: { title: 'Negocios' } },
        { properties: { title: 'Productos' } },
        { properties: { title: 'Pedidos' } },
        { properties: { title: 'Auditoria' } },
        { properties: { title: 'Empleados' } },
        { properties: { title: 'Comisiones' } },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Error al crear Google Sheet: ${err.error?.message || res.statusText}`);
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId;

  // Populate header rows for each tab
  await appendRowToGoogleSheet(spreadsheetId, 'Usuarios', ['id', 'nombre', 'email', 'rol', 'negocio_activo'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Negocios', ['id', 'nombre', 'slug', 'categoria', 'descripcion', 'tasa_comision', 'estado', 'fecha_creacion'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Productos', ['id', 'business_id', 'titulo', 'categoria', 'precio_venta', 'costo_proveedor', 'stock'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Pedidos', ['id', 'business_id', 'cliente_nombre', 'monto_total', 'metodo_pago', 'estado', 'fecha'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Auditoria', ['id', 'actor_nombre', 'accion', 'inquilino_destino', 'detalles', 'timestamp'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Empleados', ['id', 'nombre', 'email', 'cargo', 'departamento', 'fecha_ingreso'], token).catch(() => {});
  await appendRowToGoogleSheet(spreadsheetId, 'Comisiones', ['id', 'business_id', 'business_nombre', 'periodo', 'volumen_bruto', 'tasa_comision', 'monto_comision', 'estado', 'fecha_pago'], token).catch(() => {});

  return {
    spreadsheetId,
    title: data.properties.title,
    spreadsheetUrl: data.spreadsheetUrl,
    sheets: (data.sheets || []).map((s: any) => ({
      sheetId: s.properties.sheetId,
      title: s.properties.title,
      index: s.properties.index,
    })),
  };
};

export const parseBusinessesFromSheetRows = (rows: string[][]): Business[] => {
  if (!rows || rows.length <= 1) return [];
  // Skip header row
  return rows.slice(1).filter(r => r && r[0] && r[1]).map((r, idx) => {
    const id = r[0]?.trim() || `biz-${idx + 1}`;
    const name = r[1]?.trim() || 'Establecimiento';
    const slug = r[2]?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const category = r[3]?.trim() || 'General';
    const description = r[4]?.trim() || '';
    const commissionRate = parseFloat(r[5]) || 5.0;
    const rawStatus = (r[6]?.trim().toLowerCase() || 'active');
    const status: 'active' | 'pending' | 'suspended' = 
      rawStatus === 'pending' ? 'pending' : rawStatus === 'suspended' ? 'suspended' : 'active';
    const createdDate = r[7]?.trim() || new Date().toISOString().split('T')[0];

    let logo = r[8]?.trim();
    if (!logo || !logo.startsWith('http')) {
      if (id.includes('imperio') || slug.includes('imperio')) {
        logo = 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=300&auto=format&fit=crop&q=80';
      } else if (id.includes('aura') || slug.includes('aura')) {
        logo = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&auto=format&fit=crop&q=80';
      } else {
        logo = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&auto=format&fit=crop&q=80';
      }
    }

    return {
      id,
      name,
      slug,
      category,
      description,
      commissionRate,
      status,
      createdDate,
      logo,
      currency: 'USD',
      rating: 5.0,
    };
  });
};

export const fetchBusinessesFromGoogleSheets = async (
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID,
  accessToken?: string | null
): Promise<Business[] | null> => {
  const token = accessToken || getGoogleAccessToken();

  // 1. Try Google Sheets V4 API directly if token is available
  if (token) {
    try {
      const rows = await fetchSheetRows(spreadsheetId, 'Negocios', token);
      if (rows && rows.length > 1) {
        const parsed = parseBusinessesFromSheetRows(rows);
        if (parsed.length > 0) return parsed;
      }
    } catch (err) {
      console.warn('Google Sheets API token fetch error:', err);
    }
  }

  // 2. Try backend sync-from-sheet proxy endpoint
  if (token) {
    try {
      const res = await fetch('/api/sheets/sync-from-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          spreadsheetId,
          sheetTitle: 'Negocios',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.rows && data.rows.length > 1) {
          const parsed = parseBusinessesFromSheetRows(data.rows);
          if (parsed.length > 0) return parsed;
        }
      }
    } catch (err) {
      console.warn('Backend sync-from-sheet proxy error:', err);
    }
  }

  // 3. Try public CSV export endpoint (works for any public/shared Google Sheet without needing user login)
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=Negocios`;
    const res = await fetch(csvUrl);
    if (res.ok) {
      const csvText = await res.text();
      const lines = csvText
        .split('\n')
        .map(line => {
          const cells: string[] = [];
          let cur = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              cells.push(cur.trim().replace(/^"|"$/g, ''));
              cur = '';
            } else {
              cur += char;
            }
          }
          cells.push(cur.trim().replace(/^"|"$/g, ''));
          return cells;
        })
        .filter(row => row.some(cell => cell.length > 0));

      if (lines.length > 1) {
        const parsed = parseBusinessesFromSheetRows(lines);
        if (parsed.length > 0) return parsed;
      }
    }
  } catch (err) {
    console.warn('Public CSV fetch error:', err);
  }

  return null;
};

