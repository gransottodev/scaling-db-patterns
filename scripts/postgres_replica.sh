#!/bin/bash
set -e

echo "Configurando PostgreSQL Replica..."

# Este script é executado no container replica
# A configuração principal é feita no docker-compose via pg_basebackup

echo "PostgreSQL Replica configurado"