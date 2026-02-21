import db from '../config/db.js';

const COMPLEXITY_HOURS = {
  simples: 4,
  moderada: 16,
  complexa: 32,
  muito_complexa: 64,
};

const calculateProjectDeadline = async (projectId) => {
  const [features] = await db.query('SELECT complexidade FROM funcionalidades WHERE projeto_id = ?', [projectId]);
  
  if (!features.length) {
    await db.query('UPDATE projetos SET prazo_estimado_dias = 0 WHERE id = ?', [projectId]);
    return 0;
  }

  const totalHours = features.reduce((acc, feature) => {
    return acc + (COMPLEXITY_HOURS[feature.complexidade] || 0);
  }, 0);

  const bufferHours = totalHours * 1.15; // 15% buffer
  const workDays = Math.ceil(bufferHours / 8); // 8 hours per workday

  await db.query('UPDATE projetos SET prazo_estimado_dias = ? WHERE id = ?', [workDays, projectId]);

  return workDays;
};

const createProject = async (projectData) => {
  const { nome, cliente_nome, descricao } = projectData;
  const [result] = await db.query(
    'INSERT INTO projetos (nome, cliente_nome, descricao) VALUES (?, ?, ?)',
    [nome, cliente_nome, descricao]
  );
  return { id: result.insertId, ...projectData };
};

const getAllProjects = async () => {
  const [rows] = await db.query('SELECT * FROM projetos ORDER BY created_at DESC');
  return rows;
};

const getProjectById = async (id) => {
  const [projectRows] = await db.query('SELECT * FROM projetos WHERE id = ?', [id]);
  if (projectRows.length === 0) {
    return null;
  }
  const project = projectRows[0];

  const [features] = await db.query('SELECT * FROM funcionalidades WHERE projeto_id = ? ORDER BY ordem', [id]);
  project.funcionalidades = features;

  return project;
};

const addFeatureToProject = async (projectId, featureData) => {
  const { titulo, descricao, complexidade, categoria, ordem } = featureData;
  const tempo_estimado_horas = COMPLEXITY_HOURS[complexidade] || 0;

  const [result] = await db.query(
    'INSERT INTO funcionalidades (projeto_id, titulo, descricao, complexidade, tempo_estimado_horas, categoria, ordem) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [projectId, titulo, descricao, complexidade, tempo_estimado_horas, categoria, ordem]
  );
  
  await calculateProjectDeadline(projectId);

  return { id: result.insertId, projeto_id: projectId, ...featureData, tempo_estimado_horas };
};

const deleteFeature = async (featureId) => {
    const [featureRows] = await db.query('SELECT projeto_id FROM funcionalidades WHERE id = ?', [featureId]);
    if (featureRows.length === 0) {
        throw new Error('Funcionalidade não encontrada');
    }
    const { projeto_id } = featureRows[0];

    const [result] = await db.query('DELETE FROM funcionalidades WHERE id = ?', [featureId]);
    
    if (result.affectedRows > 0) {
        await calculateProjectDeadline(projeto_id);
    }

    return result.affectedRows > 0;
};

const generateScopeText = async (projectId) => {
    const project = await getProjectById(projectId);
    if (!project) {
        throw new Error('Projeto não encontrado');
    }

    let scopeText = `# Escopo do Projeto: ${project.nome}\n\n`;
    scopeText += `**Cliente:** ${project.cliente_nome}\n`;
    scopeText += `**Descrição Geral:** ${project.descricao || 'N/A'}\n\n`;
    scopeText += `## Funcionalidades\n\n`;

    if (project.funcionalidades && project.funcionalidades.length > 0) {
        project.funcionalidades.forEach(func => {
            scopeText += `### ${func.titulo}\n`;
            scopeText += `- **Descrição:** ${func.descricao || 'N/A'}\n`;
            scopeText += `- **Complexidade:** ${func.complexidade}\n`;
            scopeText += `- **Tempo Estimado:** ${func.tempo_estimado_horas} horas\n\n`;
        });
    } else {
        scopeText += "Nenhuma funcionalidade definida ainda.\n\n";
    }

    scopeText += `**Prazo Estimado Total:** ${project.prazo_estimado_dias} dias úteis.\n`;

    return scopeText;
};


export default {
  createProject,
  getAllProjects,
  getProjectById,
  addFeatureToProject,
  deleteFeature,
  generateScopeText,
};