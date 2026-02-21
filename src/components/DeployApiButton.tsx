import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Server, RefreshCw, CheckCircle2 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { PHP_API_CODE } from '@/lib/php-code';

export const DeployApiButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeploy = async () => {
    setIsLoading(true);
    try {
      // Endpoint dedicado para atualização segura
      const response = await fetch('http://206.183.128.27:3001/update-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: "dyad-auto-2024",
          code: PHP_API_CODE
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor de atualização.');
      }

      const data = await response.json();
      
      // O script PHP pode retornar erro 200 com mensagem de erro no JSON
      if (data.error) {
        throw new Error(data.error);
      }

      showSuccess('Backend atualizado com sucesso!');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Erro desconhecido ao atualizar API.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleDeploy} 
      disabled={isLoading}
      variant="outline"
      className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition-colors"
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Server className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Enviando Código...' : 'Atualizar Backend PHP'}
    </Button>
  );
};