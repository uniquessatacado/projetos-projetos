import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Server, RefreshCw, AlertTriangle } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { PHP_API_CODE } from '@/lib/php-code';

export const DeployApiButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeploy = async () => {
    setIsLoading(true);
    try {
      // Usando o endpoint de resgate 'update-api.php' pois o 'api.php' está travado com Erro 500
      const response = await fetch('http://206.183.128.27:3001/update-api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: "dyad-vai-123", // Token antigo para o script de resgate
          code: PHP_API_CODE
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao restaurar API');
      }

      showSuccess('API restaurada com sucesso! Tente atualizar a página.');
    } catch (error) {
      showError('Erro ao restaurar API. Verifique o console.');
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
      className="border-amber-200 text-amber-700 hover:bg-amber-50"
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <AlertTriangle className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Restaurando...' : 'Restaurar API (Resgate)'}
    </Button>
  );
};