import { Project, Feature, PaginatedResponse } from "@/types";

// URL atualizada com a porta 3001
const API_BASE_URL = "http://206.183.128.27:3001/api.php";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(API_BASE_URL);
  
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

// Templates Endpoints
export interface Template {
  id: number;
  nome: string;
  descricao: string;
  created_at: string;
}

export const getTemplates = async (): Promise<Template[]> => {
  const response = await request<PaginatedResponse<Template> | Template[]>('/templates');
  return extractList(response);
};

export const createTemplate = (data: { nome: string; descricao: string }): Promise<Template> => {
  return request('/templates', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteTemplate = (id: number): Promise<void> => {
  return request(`/templates/${id}`, {
    method: 'DELETE',
  });
};

// Settings Endpoints
export interface Setting {
  id: number;
  chave: string;
  valor: string;
}

export const getSettings = async (): Promise<Setting[]> => {
  const response = await request<PaginatedResponse<Setting> | Setting[]>('/configuracoes');
  return extractList(response);
};

export const saveSetting = (data: { chave: string; valor: string }): Promise<Setting> => {
  return request('/configuracoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Test Endpoint for Migration Validation
export const getTarefasTeste = async (): Promise<any[]> => {
    try {
        const response = await request<any[]>('/tarefas_teste');
        return Array.isArray(response) ? response : [];
    } catch (e) {
        throw new Error('Tabela tarefas_teste não encontrada.');
    }
};