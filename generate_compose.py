import sys

services = [
    ("api-gateway", 3000),
    ("session-service", 3001),
    ("cart-service", 3002),
    ("catalog-service", 3003),
    ("payment-service", 3004),
    ("promo-service", 3005),
    ("fraud-service", 3006),
    ("notification-service", 3007),
    ("auth-service", 3008),
    ("order-service", 3009),
    ("inventory-service", 3010),
    ("hardware-bridge", 3011),
    ("verification-service", 3012),
    ("identity-service", 3013),
    ("audit-service", 3014),
    ("analytics-service", 3015)
]

yaml = ""

for s, p in services:
    yaml += f"""
  {s}:
    build:
      context: .
      dockerfile: services/{s}/Dockerfile
    container_name: scango-{s}
    restart: unless-stopped
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

content = content.replace("    command: -config.file=/etc/promtail/promtail-config.yaml\n\nvolumes:\n", "    command: -config.file=/etc/promtail/promtail-config.yaml\n" + yaml)

with open('docker-compose.yml', 'w') as f:
    f.write(content)
