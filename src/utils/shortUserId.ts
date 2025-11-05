/**
 * Converte UUID longo para um ID curto (6 caracteres)
 * Para suportar 10 milhões de usuários, usamos base 62 (0-9, a-z, A-Z)
 * 62^6 = 56,800,235,584 possibilidades (mais que suficiente)
 */

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Gera um ID curto de 6 caracteres a partir de um UUID
 * Usa hash do UUID para garantir consistência
 */
export function getShortUserId(uuid: string): string {
  if (!uuid || uuid === "N/A" || uuid === "") return "N/A";
  
  // Remove hífens do UUID
  const cleanUuid = uuid.replace(/-/g, "").toLowerCase();
  
  // Cria um hash simples usando os primeiros caracteres do UUID
  // Usa uma combinação de caracteres para melhor distribuição
  let hash = 0;
  const len = Math.min(cleanUuid.length, 16);
  
  for (let i = 0; i < len; i++) {
    const char = cleanUuid[i];
    // Converte hex char para número (0-15)
    const val = char >= '0' && char <= '9' 
      ? char.charCodeAt(0) - 48 
      : char.charCodeAt(0) - 87;
    hash = ((hash << 4) + val) & 0x7fffffff; // Garante número positivo
  }
  
  // Converte para base 62 (6 dígitos)
  let shortId = "";
  let num = hash;
  for (let i = 0; i < 6; i++) {
    shortId = BASE62[num % 62] + shortId;
    num = Math.floor(num / 62);
  }
  
  return shortId;
}


