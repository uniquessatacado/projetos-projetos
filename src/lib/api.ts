import { Project, Feature, PaginatedResponse } from "@/types";

const API_BASE_URL = "http://206.183.128.27:8082/api/v1";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

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