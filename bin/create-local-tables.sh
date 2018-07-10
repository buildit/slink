#!/bin/bash

aws dynamodb create-table \
  --table-name LastRunDateTable \
  --attribute-definitions AttributeName=alias,AttributeType=S \
  --key-schema AttributeName=alias,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:${port:-8000}
