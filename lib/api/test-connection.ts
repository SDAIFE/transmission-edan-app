// Script de test pour vérifier la connectivité avec l'API backend
import axios from 'axios';

export const testApiConnection = async () => {
  const baseURL = '/api/backend'; // Utilise le proxy Next.js
  
  try {
    console.log('🔍 Test de connexion à l\'API backend...');
    console.log('📍 URL de l\'API:', baseURL);
    
    // Test de ping simple
    const response = await axios.get(`${baseURL}/health`, {
      timeout: 5000,
    });
    
    console.log('✅ Connexion API réussie!');
    console.log('📊 Réponse:', response.data);
    return true;
  } catch (error: unknown) {
    console.error('❌ Erreur de connexion API:');
    
    const errorObj = error as { 
      code?: string; 
      response?: { status?: number; data?: unknown }; 
      request?: unknown; 
      message?: string 
    };
    
    if (errorObj.code === 'ECONNREFUSED') {
      console.error('🚫 Le serveur backend n\'est pas accessible');
      console.error('💡 Vérifiez que votre backend NestJS est en cours d\'exécution sur:', baseURL);
    } else if (errorObj.response) {
      console.error('📡 Le serveur répond mais avec une erreur:', errorObj.response.status);
      console.error('📄 Détails:', errorObj.response.data);
    } else if (errorObj.request) {
      console.error('⏱️ Timeout ou erreur réseau');
    } else {
      console.error('🔧 Erreur inattendue:', errorObj.message);
    }
    
    return false;
  }
};

// Test de l'endpoint d'authentification spécifiquement
export const testAuthEndpoint = async () => {
  const baseURL = '/api/backend'; // Utilise le proxy Next.js
  
  try {
    console.log('🔐 Test de l\'endpoint d\'authentification...');
    
    // Test avec des credentials de test (vous pouvez les modifier)
    const response = await axios.post(`${baseURL}/auth/login`, {
      email: 'test@example.com',
      password: 'testpassword',
    }, {
      timeout: 5000,
    });
    
    console.log('✅ Endpoint auth accessible!');
    console.log('📊 Réponse:', response.data);
    return true;
  } catch (error: unknown) {
    console.error('❌ Erreur endpoint auth:');
    
    const errorObj = error as { 
      response?: { status?: number; data?: { message?: string } }; 
      message?: string 
    };
    
    if (errorObj.response) {
      console.error('📡 Status:', errorObj.response.status);
      console.error('📄 Message:', errorObj.response.data?.message || 'Pas de message d\'erreur');
      
      if (errorObj.response.status === 401) {
        console.log('✅ L\'endpoint fonctionne (erreur 401 = credentials invalides, ce qui est normal)');
        return true;
      }
    } else {
      console.error('🔧 Erreur:', errorObj.message);
    }
    
    return false;
  }
};
