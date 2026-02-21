import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Server, RefreshCw } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { PHP_API_CODE } from '@/lib/php-code';

export const DeployApiButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeploy = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://206.183.128.27:3001/update-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: "dyad-vai-123",
          code: PHP_API_CODE
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar API');
      }

      showSuccess('API atualizada com sucesso no servidor!');
    } catch (error) {
      showError('Erro ao atualizar API. Verifique o console.');
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
      className="border-primary-200 text-primary-700 hover:bg-primary-50"
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Server className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Atualizando...' : 'Atualizar API Remota'}
    </Button>
  );
};