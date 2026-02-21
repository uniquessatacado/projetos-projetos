import { Project, Feature, PaginatedResponse } from "@/types";

// URL atualizada com a porta 3001
const API_BASE_URL = "http://206.183.128.27:3001/api.php";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(API_BASE_URL);
  
  // Lógica para converter /recurso?param=valor em ?path=recurso&param=valor
  const [pathString, queryString] = endpoint.split('?');
  const cleanPath = pathString.startsWith('/') ? pathString.substring(1) : pathString;
  
  url.searchParams.set('path', cleanPath);
  
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

// Helper para tratar respostas que podem ser array direto ou objeto paginado { list: [] }
function extractList<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  return response.list || [];
}

// Project Endpoints
export const getProjects = async (): Promise<Project[]> => {
  const response = await request<PaginatedResponse<Project> | Project[]>('/projetos');
  return extractList(response);
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
  // Atualizado para usar o parametro simples projeto_id=X conforme solicitado
  const response = await request<PaginatedResponse<Feature> | Feature[]>(`/funcionalidades?projeto_id=${projectId}`);
  return extractList(response);
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