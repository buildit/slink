#!/bin/bash

# Check script got argument
if [ -z "$1" ]; then
    echo "Require IP address of dynamodb to start"    
else
    if [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
	command="LOCAL_DYNAMO_IP=$1 LAST_RUN_DATE_TABLE=LastRunDate RUNS_TABLE=Runs INTRODUCTIONS_TABLE=Introductions ACTIVATIONS_TABLE=Activations sam local invoke SlinkMainFunction -e event.json"
	eval $command
    else
	echo "Please pass valid ip address"
	echo "Passed ip address in $1"
    fi    
fi
