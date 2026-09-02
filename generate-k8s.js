const fs = require('fs');
const path = require('path');

const services = [
  "analytics-service", "api-gateway", "audit-analytics-service", 
  "audit-service", "cart-service", "catalog-service", 
  "identity-service", "inventory-service", "notification-service", 
  "payment-service", "promo-service", "session-service", "verification-service"
];

const k8sDir = path.join(__dirname, 'k8s');
if (!fs.existsSync(k8sDir)) {
  fs.mkdirSync(k8sDir);
}

let deployments = '';
let servicesYaml = '';

services.forEach(svc => {
  const port = svc === 'api-gateway' ? 3000 : 3000 + services.indexOf(svc); // just assigning arbitrary ports or 3000 container port
  // Wait, typically nestjs apps run on 3000 inside the container, and we map them to 3001-3011 externally.
  // In K8s, containerPort is usually 3000 for all.
  deployments += `---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${svc}
  labels:
    app: ${svc}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${svc}
  template:
    metadata:
      labels:
        app: ${svc}
    spec:
      containers:
        - name: ${svc}
          image: scango/${svc}:latest
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: scango-config
            - secretRef:
                name: scango-secrets
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
`;

  servicesYaml += `---
apiVersion: v1
kind: Service
metadata:
  name: ${svc}
spec:
  selector:
    app: ${svc}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
`;
});

fs.writeFileSync(path.join(k8sDir, 'deployments.yaml'), deployments);
fs.writeFileSync(path.join(k8sDir, 'services.yaml'), servicesYaml);

const configMap = `apiVersion: v1
kind: ConfigMap
metadata:
  name: scango-config
data:
  NODE_ENV: "production"
  POSTGRES_HOST: "postgres"
  POSTGRES_PORT: "5432"
  POSTGRES_USER: "scango"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  KAFKA_BROKERS: "kafka:9092"
  OTLP_ENDPOINT: "http://jaeger:4318/v1/traces"
`;
fs.writeFileSync(path.join(k8sDir, 'configmaps.yaml'), configMap);

const secrets = `apiVersion: v1
kind: Secret
metadata:
  name: scango-secrets
type: Opaque
stringData:
  POSTGRES_PASSWORD: "scango_prod_pass"
  JWT_SECRET: "prod_super_secret_jwt_key_here"
`;
fs.writeFileSync(path.join(k8sDir, 'secrets.yaml'), secrets);

const ingress = `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scango-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: api.scango.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 80
`;
fs.writeFileSync(path.join(k8sDir, 'ingress.yaml'), ingress);

console.log("K8s manifests generated.");
