const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'services');
const services = fs.readdirSync(servicesDir).filter(f => fs.statSync(path.join(servicesDir, f)).isDirectory());

const tracingContent = `import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTLP_ENDPOINT || 'grpc://localhost:4317',
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: process.env.SERVICE_NAME || 'unknown-service',
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
`;

for (const service of services) {
    const srcDir = path.join(servicesDir, service, 'src');
    if (!fs.existsSync(srcDir)) continue;

    // Write tracing.ts
    const tracingPath = path.join(srcDir, 'tracing.ts');
    fs.writeFileSync(tracingPath, tracingContent, 'utf-8');

    // Prepend to main.ts or index.ts
    const mainPath = path.join(srcDir, 'main.ts');
    const indexPath = path.join(srcDir, 'index.ts');
    let entryFile = null;
    if (fs.existsSync(mainPath)) entryFile = mainPath;
    else if (fs.existsSync(indexPath)) entryFile = indexPath;

    if (entryFile) {
        let content = fs.readFileSync(entryFile, 'utf-8');
        if (!content.includes("import './tracing'")) {
            content = `import './tracing';\n` + content;
            fs.writeFileSync(entryFile, content, 'utf-8');
            console.log(`Updated ${entryFile}`);
        }
    }

    // Update app.module.ts for NestJS services
    const appModulePath = path.join(srcDir, 'app.module.ts');
    if (fs.existsSync(appModulePath)) {
        let content = fs.readFileSync(appModulePath, 'utf-8');
        if (!content.includes('PrometheusModule')) {
            // Import PrometheusModule
            content = `import { PrometheusModule } from '@willsoto/nestjs-prometheus';\n` + content;
            
            // Add to imports array
            // Find imports: [ ... ]
            content = content.replace(/imports:\s*\[([\s\S]*?)\]/, (match, inner) => {
                // If it already has PrometheusModule, don't add
                if (inner.includes('PrometheusModule')) return match;
                return `imports: [\n    PrometheusModule.register(),${inner}]`;
            });
            fs.writeFileSync(appModulePath, content, 'utf-8');
            console.log(`Updated ${appModulePath}`);
        }
    }
}
