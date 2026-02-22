import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, Search, Plus, Copy, Trash2, Eye, EyeOff, Link as LinkIcon, Lock, User as UserIcon, FileText, Edit2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProject } from '@/lib/api';
import { parseMetadata, stringifyMetadata, getCleanDescription } from '@/lib/meta-utils';
import { showSuccess } from '@/utils/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ProjectVault = ({ project }: { project: any }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<number, boolean>>({});

  // Form State
  const [form, setForm] = useState({ title: '', link: '', login: '', password: '', type: 'acesso' as 'acesso' | 'nota' });

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
      resetForm();
    }
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ title: '', link: '', login: '', password: '', type: 'acesso' });
  };

  const handleSave = () => {
    if (!form.title) return;
    let newItems;
    if (editingId) {
      newItems = vaultItems.map((i: any) => i.id === editingId ? { ...form, id: editingId } : i);
    } else {
      newItems = [...vaultItems, { ...form, id: Date.now() }];
    }
    updateVault.mutate(newItems);
  };

  const removeItem = (id: number) => {
    if (confirm('Remover este item?')) {
        updateVault.mutate(vaultItems.filter((i: any) => i.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showSuccess('Copiado!');
  };

  const startEdit = (item: any) => {
    setForm(item);
    setEditingId(item.id);
    setIsAdding(true);
  };

  const filteredItems = vaultItems.filter((i: any) => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.login && i.login.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (i.password && i.password.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const acessos = filteredItems.filter((i: any) => i.type === 'acesso');
  const notas = filteredItems.filter((i: any) => i.type === 'nota');

  return (
    <Card className="shadow-soft border-slate-100 overflow-hidden">
      <CardHeader className="bg-slate-900 text-white flex flex-row items-center justify-between py-4">
        <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Cofre Técnico</CardTitle>
        </div>
        <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-8 px-2" onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 mr-1" /> Novo
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="acessos" className="w-full">
            <div className="bg-slate-100 p-1 flex items-center justify-between gap-2">
                <TabsList className="bg-transparent">
                    <TabsTrigger value="acessos" className="text-[10px] font-black uppercase">Logins e APIs</TabsTrigger>
                    <TabsTrigger value="notas" className="text-[10px] font-black uppercase">Observações</TabsTrigger>
                </TabsList>
                <div className="relative flex-1 max-w-[200px] mr-2">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <Input 
                        placeholder="Pesquisar..." 
                        className="pl-7 h-7 text-[10px] bg-white" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="p-4">
                {isAdding && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-4 animate-fade-in shadow-inner">
                    <div className="flex gap-2 mb-2">
                        <Button 
                            size="sm" 
                            variant={form.type === 'acesso' ? 'default' : 'outline'} 
                            className="text-[10px] font-bold h-7"
                            onClick={() => setForm({...form, type: 'acesso'})}
                        >Acesso/API</Button>
                        <Button 
                            size="sm" 
                            variant={form.type === 'nota' ? 'default' : 'outline'} 
                            className="text-[10px] font-bold h-7"
                            onClick={() => setForm({...form, type: 'nota'})}
                        >Observação</Button>
                    </div>

                    <Input placeholder="Título (ex: SSH Produção)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    
                    {form.type === 'acesso' ? (
                        <div className="space-y-2">
                            <Input placeholder="Link de Acesso (URL/IP)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Usuário/Login" value={form.login} onChange={e => setForm({...form, login: e.target.value})} />
                                <Input placeholder="Senha/Chave" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                            </div>
                        </div>
                    ) : (
                        <Textarea placeholder="Descreva observações, procedimentos ou detalhes..." value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="min-h-[100px]" />
                    )}

                    <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-emerald-600 font-bold" onClick={handleSave}>
                            {editingId ? 'Atualizar' : 'Salvar no Cofre'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={resetForm}>Cancelar</Button>
                    </div>
                </div>
                )}

                <TabsContent value="acessos" className="mt-0 space-y-2">
                    {acessos.map((item: any) => (
                        <div key={item.id} className="group p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{item.title}</p>
                                    {item.link && (
                                        <a href={item.link.startsWith('http') ? item.link : `http://${item.link}`} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 hover:underline flex items-center gap-1 mt-1 font-bold">
                                            <LinkIcon className="w-2.5 h-2.5" /> Acessar Link
                                        </a>
                                    )}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(item)}><Edit2 className="w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="w-3" /></Button>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-400 uppercase font-black">Login</span>
                                        <span className="text-[11px] font-mono font-bold truncate max-w-[100px]">{item.login || '---'}</span>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => copyToClipboard(item.login)}><Copy className="w-2.5" /></Button>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-400 uppercase font-black">Senha</span>
                                        <span className="text-[11px] font-mono font-bold">
                                            {visibleKeys[item.id] ? item.password : '••••••••'}
                                        </span>
                                    </div>
                                    <div className="flex gap-0.5">
                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setVisibleKeys(v => ({...v, [item.id]: !v[item.id]}))}>
                                            {visibleKeys[item.id] ? <EyeOff className="w-2.5" /> : <Eye className="w-2.5" />}
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => copyToClipboard(item.password)}><Copy className="w-2.5" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {acessos.length === 0 && <p className="text-center py-8 text-xs text-slate-400 italic">Nenhum acesso registrado.</p>}
                </TabsContent>

                <TabsContent value="notas" className="mt-0 space-y-2">
                    {notas.map((item: any) => (
                        <div key={item.id} className="group p-4 bg-amber-50/50 border border-amber-100 rounded-xl hover:border-amber-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="text-xs font-black text-amber-900 uppercase flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> {item.title}
                                </h4>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(item)}><Edit2 className="w-3" /></Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => removeItem(item.id)}><Trash2 className="w-3" /></Button>
                                </div>
                            </div>
                            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{item.password}</p>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="mt-2 h-6 text-[9px] font-black text-amber-700 hover:bg-amber-100 p-1"
                                onClick={() => copyToClipboard(item.password)}
                            >
                                <Copy className="w-2.5 mr-1" /> Copiar Nota
                            </Button>
                        </div>
                    ))}
                    {notas.length === 0 && <p className="text-center py-8 text-xs text-slate-400 italic">Nenhuma observação técnica.</p>}
                </TabsContent>
            </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};