import mongoose from 'mongoose';
import dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectMongo = async () => {
  try {
    console.log('⏳ [MONGO]: Tentando conexão via SRV...');
    
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 20000,
      family: 4,
    });

    console.log('✅ [MONGO]: CONECTADO NA NUVEM ATLAS!');
  } catch (error: any) {
    console.error('❌ [MONGO]: Erro na conexão!');
    console.error(error.message);
    
    process.exit(1);
  }
};