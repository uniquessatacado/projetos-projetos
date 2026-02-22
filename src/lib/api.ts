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

// Projetos
export const getProjects = async (): Promise<Project[]> => extractList(await request<any>('/projetos'));
export const getProjectById = (id: string): Promise<Project> => request(`/projetos/${id}`);
export const createProject = (data: any): Promise<Project> => request('/projetos', { method: 'POST', body: JSON.stringify(data) });
export const updateProject = (id: number, data: Partial<Project>): Promise<void> => request(`/projetos/${id}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteProject = (id: number): Promise<void> => request(`/projetos/${id}`, { method: 'DELETE' });

// Clientes
export const updateClient = (originalName: string, data: { new_name: string, new_whatsapp: string }): Promise<void> => {
  return request('/clientes', { 
    method: 'POST', 
    body: JSON.stringify({ original_name: originalName, ...data }) 
  });
};

// Funcionalidades
export const getFeaturesByProjectId = async (projectId: number): Promise<Feature[]> => extractList(await request<any>(`/funcionalidades?projeto_id=${projectId}`));
export const createFeature = (data: any): Promise<Feature> => request('/funcionalidades', { method: 'POST', body: JSON.stringify(data) });
export const updateFeature = (id: number, data: Partial<Feature>): Promise<void> => request(`/funcionalidades/${id}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteFeature = (id: number): Promise<void> => request(`/funcionalidades/${id}`, { method: 'DELETE' });

// Templates
export const getTemplates = async (): Promise<Template[]> => extractList(await request<any>('/templates'));
export const createTemplate = (data: any): Promise<Template> => request('/templates', { method: 'POST', body: JSON.stringify(data) });
export const deleteTemplate = (id: number): Promise<void> => request(`/templates/${id}`, { method: 'DELETE' });

// Base de Conhecimento (Knowledge Base)
export const getKnowledgeBaseItems = async (): Promise<any[]> => extractList(await request<any>('/knowledge_base'));
export const createKnowledgeBaseItem = (data: any): Promise<any> => request('/knowledge_base', { method: 'POST', body: JSON.stringify(data) });
export const deleteKnowledgeBaseItem = (id: number): Promise<void> => request(`/knowledge_base/${id}`, { method: 'DELETE' });

// Configurações
export const getSettings = async (): Promise<Setting[]> => extractList(await request<any>('/configuracoes'));
export const saveSetting = (data: any): Promise<void> => request('/configuracoes', { method: 'POST', body: JSON.stringify(data) });

// Admin Vault
export const getAdminVaultItems = async (): Promise<any[]> => extractList(await request<any>('/admin_vault'));
export const createAdminVaultItem = (data: any): Promise<any> => request('/admin_vault', { method: 'POST', body: JSON.stringify(data) });
export const updateAdminVaultItem = (id: number, data: any): Promise<void> => request(`/admin_vault/${id}`, { method: 'POST', body: JSON.stringify(data) });
export const deleteAdminVaultItem = (id: number): Promise<void> => request(`/admin_vault/${id}`, { method: 'DELETE' });