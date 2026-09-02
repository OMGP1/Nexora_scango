import sys
import re

services = [
    ("api-gateway", 3000),
    ("session-service", 3001),
    ("cart-service", 3002),
    ("catalog-service", 3003),
    ("payment-service", 3004),
    ("promo-service", 3005),
    ("notification-service", 3007),
    ("inventory-service", 3010),
    ("verification-service", 3012),
    ("identity-service", 3013),
    ("audit-service", 3014),
    ("analytics-service", 3015)
]

yaml = ""

for s, p in services:
    command = f"node services/{s}/dist/index.js" if s == "api-gateway" else f"node services/{s}/dist/main.js"
    
    yaml += f"""
  {s}:
    image: node:20-alpine
    container_name: scango-{s}
    restart: unless-stopped
    working_dir: /app
    volumes:
      - .:/app
    command: {command}
    ports:
      - "{p}:{p}"
    env_file:
      - .env
    environment:
      - REDIS_HOST=redis
      - POSTGRES_HOST=postgres
      - KAFKA_BROKERS=kafka:9092
      - OPENSEARCH_URL=http://opensearch:9200
      - MINIO_ENDPOINT=minio
      - BACKEND_HOST=api-gateway
"""
    # for api gateway, inject all hosts
    if s == "api-gateway":
        for s2, p2 in services:
            if s2 != "api-gateway":
                env_var = f"{s2.upper().replace('-', '_')}_HOST"
                yaml += f"      - {env_var}={s2}\n"
                
yaml += "\nvolumes:\n"

with open('docker-compose.yml', 'r') as f:
    content = f.read()

# We need to replace from the end of promtail to the end of the file
# since I previously appended the bad services block
match = re.search(r'    command: -config\.file=/etc/promtail/promtail-config\.yaml\n', content)
if match:
    content = content[:match.end()] + yaml

with open('docker-compose.yml', 'w') as f:
    f.write(content)
