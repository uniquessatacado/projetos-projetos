import { Project, Feature, PaginatedResponse } from "@/types";

// Nova URL base apontando para o script PHP
const API_BASE_URL = "http://206.183.128.27/api.php";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(API_BASE_URL);
  
  // Separa o caminho (path) e os parâmetros de consulta (query) do endpoint solicitado
  // Exemplo: "/funcionalidades?where=(...)" vira path="funcionalidades" e query="where=(...)"
  const [pathString, queryString] = endpoint.split('?');
  
  // Remove a barra inicial do path, se houver
  const cleanPath = pathString.startsWith('/') ? pathString.substring(1) : pathString;
  
  // Define o parâmetro 'path' que o script PHP espera
  url.searchParams.set('path', cleanPath);
  
  // Se existirem parâmetros de consulta originais (como filtros do NocoDB), adiciona-os à URL
  if (queryString) {
    const params = new URLSearchParams(queryString);
    params.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Faz a requisição para a URL construída (ex: .../api.php?path=projetos&where=...)
  const response = await fetch(url.toString(), { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
  }
  
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// Project Endpoints
export const getProjects = async (): Promise<Project[]> => {
  const response = await request<PaginatedResponse<Project>>('/projetos');
  return response.list;
};

export const getProjectById = (id: string): Promise<Project> => request(`/projetos/${id}`);

export const createProject = (data: { nome: string; cliente_nome: string; descricao?: string }): Promise<Project> => {
  return request('/projetos', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Feature Endpoints
export const getFeaturesByProjectId = async (projectId: number): Promise<Feature[]> => {
  const response = await request<PaginatedResponse<Feature>>(`/funcionalidades?where=(projeto_id,eq,${projectId})`);
  return response.list;
};

export const createFeature = (data: Omit<Feature, 'id'>): Promise<Feature> => {
    return request('/funcionalidades', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const deleteFeature = (id: number): Promise<void> => {
    return request(`/funcionalidades/${id}`, {
        method: 'DELETE',
    });
};