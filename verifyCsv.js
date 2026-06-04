import fs from 'fs';
import path from 'path';

const csvPath = 'C:\\Users\\smled\\Desktop\\luiscosas\\opencode\\geminiCli\\transactions.csv';

try {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`El archivo CSV no existe en la ruta: ${csvPath}`);
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.trim().split('\n');
  
  console.log(`[VERIFY CSV]: Archivo encontrado con ${lines.length} líneas.`);
  
  const headers = lines[0].split(',');
  console.log(`[VERIFY CSV]: Columnas detectadas ->`, headers);
  
  if (headers.length !== 8) {
    throw new Error(`Se esperaban 8 columnas, pero se encontraron ${headers.length}`);
  }
  
  console.log('[VERIFY CSV SUCCESS]: El formato del CSV es válido para la importación en Supabase.');
  process.exit(0);
} catch (error) {
  console.error('[VERIFY CSV FAILED]:', error.message);
  process.exit(1);
}
