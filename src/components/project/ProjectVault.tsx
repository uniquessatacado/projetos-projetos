import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Search, Plus, Copy, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/lib/api';
import { parseMetadata, stringifyMetadata, getCleanDescription } from '@/lib/meta-utils';
import { showSuccess } from '@/utils/toast';

export const ProjectVault = ({ project }: { project: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newValue, setNewValue] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

  const queryClient = useQueryClient();
  const meta = parseMetadata<any>(project.descricao);
  const vaultItems = meta.vault || [];

  const updateVault = useMutation({
    mutationFn: (newItems: any[]) => {
      const updatedDesc = stringifyMetadata(getCleanDescription(project.descricao), { ...meta, vault: newItems });
      return updateProject(project.id, { ...project, descricao: updatedDesc });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id.toString()] });
      setIsAdding(false);
      setNewTitle('');
      setNewValue('');
    }
  });

  const addItem = () => {
    if (!newTitle || !newValue) return;
    updateVault.mutate([...vaultItems, { id: Date.now(), title: newTitle, value: newValue }]);
  };

  const removeItem = (id: number) => {
    if (confirm('Remover este acesso?')) {
        updateVault.mutate(vaultItems.filter((i: any) => i.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copiado para a área de transferência!');
  };

  const filteredItems = vaultItems.filter((i: any) => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="shadow-soft border-slate-100">
      <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-900 text-white rounded-t-xl">
        <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
          <Shield className="w-4 h-4 text-emerald-400" /> Cofre de Acessos
        </CardTitle>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {isAdding && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
            <Input placeholder="Título (ex: Servidor Root)" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
            <Input placeholder="Senha ou Chave API" value={newValue} onChange={e => setNewValue(e.target.value)} />
            <div className="flex gap-2">
                <Button size="sm" className="flex-1 bg-emerald-600" onClick={addItem}>Salvar</Button>
                <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Pesquisar no cofre..." 
            className="pl-10 h-9 text-xs" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredItems.map((item: any) => (
            <div key={item.id} className="group p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-200 transition-all flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <p className="text-[10px] font-black text-slate-400 uppercase leading-tight">{item.title}</p>
                <p className="text-xs font-mono font-bold text-slate-800 truncate mt-1">
                  {visibleKeys[item.id] ? item.value : '••••••••••••'}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setVisibleKeys(v => ({...v, [item.id]: !v[item.id]}))}>
                  {visibleKeys[item.id] ? <EyeOff className="w-3.5" /> : <Eye className="w-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-indigo-600" onClick={() => copyToClipboard(item.value)}>
                  <Copy className="w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => removeItem(item.id)}>
                  <Trash2 className="w-3.5" />
                </Button>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <p className="text-center py-4 text-xs text-slate-400">Nenhum item encontrado.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};