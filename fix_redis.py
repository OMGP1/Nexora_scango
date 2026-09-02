import re

with open('docker-compose.yml', 'r') as f:
    content = f.read()

content = content.replace('- REDIS_HOST=redis\n', '- REDIS_HOST=redis\n      - REDIS_URL=redis://redis:6379\n')

with open('docker-compose.yml', 'w') as f:
    f.write(content)
