import re

with open('docker-compose.yml', 'r') as f:
    content = f.read()

content = content.replace('- POSTGRES_HOST=postgres\n', '- POSTGRES_HOST=postgres\n      - POSTGRES_PORT=5432\n')

with open('docker-compose.yml', 'w') as f:
    f.write(content)
