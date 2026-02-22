import { Project, Feature, PaginatedResponse, Template, Setting } from "@/types";

const API_BASE_URL = "http://206.183.128.27:3001/api.php";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(API_BASE_URL);
  const [pathString, queryString] = endpoint.split('?');
  const cleanPath = pathString.startsWith('/') ? pathString.substring(1) : pathString;
  url.searchParams.set('path', cleanPath);
  
  if (queryString) {
    const params = new URLSearchParams(queryString);
    params.forEach((value, key) => url.searchParams.append(key, value));
  }

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const response = await fetch(url.toString(), { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || 'Ocorreu um erro na requisição.');
  }
  
  if (response.status === 204) return null as T;
  return response.json();
}

function extractList<T>(response: PaginatedResponse<T> | T[]): T[] {
  if (Array.isArray(response)) return response;
  return response.list || [];
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await request<PaginatedResponse<Project> | Project[]>('/projetos');
  return extractList(response);
};

export const getProjectById = (id: string): Promise<Project> => request(`/projetos/${id}`);

export const createProject = (data: any): Promise<Project> => request('/projetos', { method: 'POST', body: JSON.stringify(data) });

export const updateProject = (id: number, data: Partial<Project>): Promise<void> => request(`/projetos/${id}`, { method: 'POST', body: JSON.stringify(data) });

export const deleteProject = (id: number): Promise<void> => request(`/projetos/${id}`, { method: 'DELETE' });

export const getFeaturesByProjectId = async (projectId: number): Promise<Feature[]> => {
  const response = await request<PaginatedResponse<Feature> | Feature[]>(`/funcionalidades?projeto_id=${projectId}`);
  return extractList(response);
};

export const createFeature = (data: any): Promise<Feature> => request('/funcionalidades', { method: 'POST', body: JSON.stringify(data) });

export const updateFeature = (id: number, data: Partial<Feature>): Promise<void> => request(`/funcionalidades/${id}`, { method: 'POST', body: JSON.stringify(data) });

export const deleteFeature = (id: number): Promise<void> => request(`/funcionalidades/${id}`, { method: 'DELETE' });

export const getTemplates = async (): Promise<Template[]> => extractList(await request<any>('/templates'));
export const createTemplate = (data: any): Promise<Template> => request('/templates', { method: 'POST', body: JSON.stringify(data) });
export const deleteTemplate = (id: number): Promise<void> => request(`/templates/${id}`, { method: 'DELETE' });
export const getSettings = async (): Promise<Setting[]> => extractList(await request<any>('/configuracoes'));
export const saveSetting = (data: any): Promise<void> => request('/configuracoes', { method: 'POST', body: JSON.stringify(data) });