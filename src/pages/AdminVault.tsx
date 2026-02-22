"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminVaultItems, createAdminVaultItem, updateAdminVaultItem, deleteAdminVaultItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, KeyRound, StickyNote, User, Copy, Trash2, Edit, Eye, EyeOff, Link as LinkIcon } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminVaultItem } from "@/types";
import { VaultItemDialog } from "../components/admin-vault/VaultItemDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminVault = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminVaultItem | null>(null);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<number, boolean>>({});

  const { data: items, isLoading } = useQuery<AdminVaultItem[]>({
    queryKey: ['admin_vault'],
    queryFn: getAdminVaultItems,
  });

  const mutation = useMutation({
    mutationFn: ({ data, id }: { data: any, id?: number }) => 
      id ? updateAdminVaultItem(id, data) : createAdminVaultItem(data),
    onSuccess: () => {
      showSuccess('Item salvo com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['admin_vault'] });
      setIsDialogOpen(false);
      setEditingItem(null);
    },
    onError: (error: Error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminVaultItem,
    onSuccess: () => {
      showSuccess('Item removido!');
      queryClient.invalidateQueries({ queryKey: ['admin_vault'] });
    },
    onError: (error: Error) => showError(error.message),
  });

  const handleSave = (data: any, id?: number) => {
    mutation.mutate({ data, id });
  };

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showSuccess('Copiado!');
  };

  const filteredItems = useMemo(() => {
    return items?.filter(i => 
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.link?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  }, [items, searchTerm]);

  const getIcon = (type: AdminVaultItem['item_type']) => {
    switch (type) {
      case 'login': return <User className="w-5 h-5" />;
      case 'api': return <KeyRound className="w-5 h-5" />;
      case 'note': return <StickyNote className="w-5 h-5" />;
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-slide-up max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Cofre Admin</h1>
          <p className="text-slate-500 font-medium">Seu repositório seguro de credenciais e notas.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-glow" onClick={() => { setEditingItem(null); setIsDialogOpen(true); }}>
          <Plus className="w-5 h-5 mr-2" /> Adicionar Item
        </Button>
      </header>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input 
            placeholder="Pesquisar por título, usuário ou URL..." 
            className="pl-12 h-14 text-lg rounded-2xl border-slate-200 shadow-soft" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({length: 6}).map((_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl p-5 shadow-card border border-transparent hover:border-indigo-200 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500">{getIcon(item.item_type)}</div>
                  <h3 className="font-bold text-slate-800">{item.title}</h3>
                </div>
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => { if(confirm('Excluir este item?')) deleteMutation.mutate(item.id)}}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {item.item_type === 'note' ? (
                <div className="bg-amber-50/50 p-3 rounded-lg text-xs text-slate-700 whitespace-pre-wrap flex-1 font-mono relative">
                  {item.secret_value}
                  <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6" onClick={() => copyToClipboard(item.secret_value)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {item.link && (
                    <a href={item.link.startsWith('http') ? item.link : `http://${item.link}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:underline">
                      <LinkIcon className="w-3 h-3" /> {item.link}
                    </a>
                  )}
                  <div className="bg-slate-50 p-2 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-600">{item.username}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(item.username)}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-600">{visibleSecrets[item.id] ? item.secret_value : '••••••••••'}</span>
                    <div className="flex items-center">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setVisibleSecrets(v => ({...v, [item.id]: !v[item.id]}))}>
                        {visibleSecrets[item.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(item.secret_value)}><Copy className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {filteredItems.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">Nenhum item encontrado.</p>
            <p className="text-slate-400 mt-2">Clique em "Adicionar Item" para começar.</p>
        </div>
      )}

      <VaultItemDialog 
        item={editingItem}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSave}
        isSaving={mutation.isPending}
      />
    </div>
  );
};

export default AdminVault;