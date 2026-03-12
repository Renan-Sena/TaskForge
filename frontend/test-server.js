import http from 'http';

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
};

console.log('🔍 Testando servidor frontend...');

const req = http.request(options, (res) => {
    console.log(`📥 Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode === 200) {
            console.log('✅ Servidor frontend funcionando!');
            console.log('📦 Resposta:', JSON.parse(data));
        } else {
            console.log('❌ Servidor retornou erro:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Erro ao conectar ao servidor:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando com "npm start"');
});

req.end();