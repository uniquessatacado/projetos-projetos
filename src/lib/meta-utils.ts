export const parseMetadata = <T>(descricao: string | undefined): T => {
  if (!descricao) return {} as T;
  try {
    // Tenta encontrar o marcador JSON no final da descrição ou se a descrição inteira for JSON
    if (descricao.startsWith('{') && descricao.endsWith('}')) {
      return JSON.parse(descricao);
    }
    
    // Se a descrição contiver texto e depois JSON (formato: Descrição Texto ###JSON###{"chave":"valor"})
    const parts = descricao.split('###JSON###');
    if (parts.length > 1) {
      return JSON.parse(parts[1]);
    }
    
    return {} as T;
  } catch (e) {
    return {} as T;
  }
};

export const stringifyMetadata = (text: string, meta: any): string => {
  const cleanText = text.split('###JSON###')[0].trim();
  return `${cleanText} ###JSON###${JSON.stringify(meta)}`;
};

export const getCleanDescription = (descricao: string | undefined): string => {
  if (!descricao) return "";
  return descricao.split('###JSON###')[0].trim();
};