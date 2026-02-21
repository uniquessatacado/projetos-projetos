import projectService from '../services/projectService.js';

const createProject = async (req, res) => {
  try {
    const { nome, cliente_nome, descricao } = req.body;
    if (!nome || !cliente_nome) {
      return res.status(400).json({ message: 'Nome e cliente_nome são obrigatórios.' });
    }
    const project = await projectService.createProject({ nome, cliente_nome, descricao });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar projeto', error: error.message });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar projetos', error: error.message });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectService.getProjectById(id);
    if (!project) {
      return res.status(404).json({ message: 'Projeto não encontrado.' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar projeto', error: error.message });
  }
};

const addFeatureToProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { titulo, descricao, complexidade, categoria, ordem } = req.body;
        if (!titulo || !complexidade) {
            return res.status(400).json({ message: 'Título e complexidade são obrigatórios.' });
        }
        const feature = await projectService.addFeatureToProject(projectId, { titulo, descricao, complexidade, categoria, ordem });
        res.status(201).json(feature);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao adicionar funcionalidade', error: error.message });
    }
};

const generateScopeText = async (req, res) => {
    try {
        const { id } = req.params;
        const scopeText = await projectService.generateScopeText(id);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(200).send(scopeText);
    } catch (error) {
        if (error.message === 'Projeto não encontrado') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao gerar escopo', error: error.message });
    }
};

export default {
  createProject,
  getAllProjects,
  getProjectById,
  addFeatureToProject,
  generateScopeText,
};