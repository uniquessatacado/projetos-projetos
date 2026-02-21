import projectService from '../services/projectService.js';

const deleteFeature = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await projectService.deleteFeature(id);
        if (!success) {
            return res.status(404).json({ message: 'Funcionalidade não encontrada.' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar funcionalidade', error: error.message });
    }
};

export default {
    deleteFeature,
};