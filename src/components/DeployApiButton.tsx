"use client";

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
          token: "dyad-auto-2024",
          code: PHP_API_CODE
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) errorMessage = errorJson.error;
        } catch (e) {
          if (errorText) errorMessage = errorText.substring(0, 100);
        }
        
        throw new Error(errorMessage);
      }

      showSuccess('Backend atualizado com sucesso!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro de rede ou bloqueio de segurança (CORS/Mixed Content)';
      showError(msg);
      console.error('Update Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleDeploy} 
      disabled={isLoading}
      variant="outline"
      className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
    >
      {isLoading ? (
        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Server className="w-4 h-4 mr-2" />
      )}
      {isLoading ? 'Atualizando...' : 'Atualizar Backend PHP'}
    </Button>
  );
};