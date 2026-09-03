const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
const env = { ...process.env };

const servicesDir = path.join(__dirname, 'services');
const services = fs.readdirSync(servicesDir).filter(f => fs.statSync(path.join(servicesDir, f)).isDirectory());

const processes = [];

services.forEach(service => {
    let mainPath = path.join(servicesDir, service, 'dist', 'main.js');
    if (!fs.existsSync(mainPath)) {
        mainPath = path.join(servicesDir, service, 'dist', 'index.js');
    }
    
    if (fs.existsSync(mainPath)) {
        console.log(`Starting ${service}...`);
        const child = spawn('node', [mainPath], { env, stdio: 'inherit', cwd: path.join(servicesDir, service) });
        processes.push(child);
    }
});

process.on('SIGINT', () => {
    processes.forEach(p => p.kill());
    process.exit(0);
});
