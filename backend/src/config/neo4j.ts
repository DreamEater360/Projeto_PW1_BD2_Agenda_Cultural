import neo4j, { Driver } from 'neo4j-driver';

export let neo4jDriver: Driver;

export const connectNeo4j = async () => {
  try {
    console.log('⏳ [NEO4J]: Tentando conectar ao AuraDB...');
    
    neo4jDriver = neo4j.driver(
      process.env.NEO4J_URI!,
      neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
    );

    await neo4jDriver.verifyConnectivity();
    console.log('✅ [NEO4J]: Conectado com sucesso!');
  } catch (error: any) {
    console.error('❌ [NEO4J]: Falha na conexão!');
    console.error(error.message);
    process.exit(1);
  }
};