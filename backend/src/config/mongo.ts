import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectMongo = async () => {
  try {
    console.log('⏳ [MONGO]: Tentando conexão via SRV...');
    
    // Use a string CURTA (aquela com +srv) no seu .env
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 20000,
      family: 4, // Força IPv4
    });

    console.log('✅ [MONGO]: CONECTADO NA NUVEM ATLAS!');
  } catch (error: any) {
    console.error('❌ [MONGO]: Erro na conexão!');
    console.error(error.message);
    
    // Se ainda der erro, vamos dar a dica final
    if(error.message.includes('querySrv')) {
       console.log('💡 [DICA]: O hack de DNS falhou. Tente usar uma VPN (como a do Opera ou Proton) apenas para testar.');
    }
    
    process.exit(1);
  }
};