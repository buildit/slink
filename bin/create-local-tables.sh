#!/bin/bash

aws dynamodb create-table \
  --table-name LastRunDate \
  --attribute-definitions AttributeName=alias,AttributeType=S \
  --key-schema AttributeName=alias,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:${port:-8000}

aws dynamodb create-table \
  --table-name Runs \
  --attribute-definitions AttributeName=requestId,AttributeType=S AttributeName=alias,AttributeType=S \
  --key-schema AttributeName=requestId,KeyType=HASH AttributeName=alias,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:${port:-8000}

aws dynamodb create-table \
  --table-name Introductions \
  --attribute-definitions AttributeName=srCandidateId,AttributeType=S AttributeName=alias,AttributeType=S \
  --key-schema AttributeName=srCandidateId,KeyType=HASH  AttributeName=alias,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:${port:-8000}

aws dynamodb create-table \
  --table-name Activations \
  --attribute-definitions AttributeName=srCandidateId,AttributeType=S AttributeName=alias,AttributeType=S \
  --key-schema AttributeName=srCandidateId,KeyType=HASH  AttributeName=alias,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:${port:-8000}
