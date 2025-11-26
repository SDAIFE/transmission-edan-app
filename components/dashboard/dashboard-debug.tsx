'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardApi } from '@/lib/api/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export function DashboardDebug() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<Array<{test: string; status: string; details?: any}>>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results: Array<{test: string; status: string; details?: any}> = [];

    // Test 1: Informations utilisateur
    results.push({
      test: 'Informations Utilisateur',
      status: 'info',
      details: {
        isAuthenticated,
        user: user ? {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role?.code
        } : null
      }
    });

    if (!isAuthenticated || !user) {
      setTestResults(results);
      setTesting(false);
      return;
    }

    // Test 2: Token JWT
    try {
      const token = localStorage.getItem('auth_token');
      results.push({
        test: 'Token JWT',
        status: token ? 'success' : 'error',
        details: {
          hasToken: !!token,
          tokenLength: token?.length || 0,
          tokenPreview: token ? `${token.substring(0, 20)}...` : 'Aucun token'
        }
      });
    } catch (error) {
      results.push({
        test: 'Token JWT',
        status: 'error',
        details: { error: 'Erreur lors de la récupération du token' }
      });
    }

    // Test 3: Appel API selon le rôle
    const userRole = user.role?.code;
    
    try {
      if (userRole === 'USER') {
        results.push({
          test: 'Appel API USER',
          status: 'testing',
          details: { message: 'Test en cours...' }
        });
        
        const userMetrics = await dashboardApi.getUserDashboardMetrics();
        results[results.length - 1] = {
          test: 'Appel API USER',
          status: 'success',
          details: {
            message: 'Métriques utilisateur récupérées',
            data: userMetrics
          }
        };
      } else if (userRole === 'ADMIN' || userRole === 'SADMIN') {
        results.push({
          test: 'Appel API ADMIN',
          status: 'testing',
          details: { message: 'Test en cours...' }
        });
        
        const adminMetrics = await dashboardApi.getAdminDashboardMetrics();
        results[results.length - 1] = {
          test: 'Appel API ADMIN',
          status: 'success',
          details: {
            message: 'Métriques admin récupérées',
            data: adminMetrics
          }
        };
      }
    } catch (error: unknown) {
      results[results.length - 1] = {
        test: userRole === 'USER' ? 'Appel API USER' : 'Appel API ADMIN',
        status: 'error',
        details: {
          message: 'Erreur API',
          error: {
            message: error instanceof Error ? error.message : 'Erreur inconnue',
            status: (error as any)?.response?.status,
            statusText: (error as any)?.response?.statusText,
            data: (error as any)?.response?.data
          }
        }
      };
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'testing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Succès</Badge>;
      case 'error':
        return <Badge variant="destructive">Erreur</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500">Attention</Badge>;
      case 'testing':
        return <Badge variant="outline">Test en cours</Badge>;
      case 'info':
        return <Badge variant="outline">Info</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Debug Dashboard API
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Outil de diagnostic pour vérifier la connexion avec l&apos;API dashboard
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Tests en cours...
            </>
          ) : (
            'Lancer les Tests de Diagnostic'
          )}
        </Button>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Résultats des Tests</h3>
            {testResults.map((result, index) => (
              <Card key={index} className="border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.test}</span>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Instructions pour l&apos;équipe Backend :</strong>
            <br />
            1. Vérifiez les logs du serveur lors de l&apos;exécution de ces tests
            <br />
            2. Assurez-vous que les endpoints `/api/dashboard/user-metrics` et `/api/dashboard/admin-metrics` sont implémentés
            <br />
            3. Vérifiez que l&apos;authentification JWT fonctionne correctement
            <br />
            4. Consultez le document `docs/DEBUG_BACKEND_DASHBOARD.md` pour plus de détails
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
