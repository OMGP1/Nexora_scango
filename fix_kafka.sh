#!/bin/bash
find services -name "*.ts" -type f | xargs grep -l "new Kafka(" | while read -r file; do
    sed -i '' "s/import { Kafka } from 'kafkajs'/import { Kafka } from 'kafkajs';\nimport { createKafkaClient } from '@scango\/kafka'/g" "$file"
    sed -i '' 's/new Kafka(/createKafkaClient(/g' "$file"
done
