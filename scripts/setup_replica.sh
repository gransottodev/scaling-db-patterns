#!/bin/bash
set -e

echo "Configurando PostgreSQL Replica..."

# Aguardar o master estar disponível
until pg_isready -h postgres_master -p 5432 -U postgres; do
    echo "Aguardando PostgreSQL Master estar disponível..."
    sleep 5
done

# Limpar o diretório de dados se existir
rm -rf /var/lib/postgresql/data/*

# Fazer backup base do master
PGPASSWORD="$POSTGRES_REPLICATION_PASSWORD" pg_basebackup \
    -h postgres_master \
    -D /var/lib/postgresql/data \
    -U "$POSTGRES_REPLICATION_USER" \
    -v -P -R -W

# Configurar como standby
echo "primary_conninfo = 'host=postgres_master port=5432 user=$POSTGRES_REPLICATION_USER password=$POSTGRES_REPLICATION_PASSWORD'" >> /var/lib/postgresql/data/postgresql.auto.conf
echo "hot_standby = on" >> /var/lib/postgresql/data/postgresql.auto.conf

# Criar arquivo standby.signal (PostgreSQL 12+)
touch /var/lib/postgresql/data/standby.signal

# Ajustar permissões
chown -R postgres:postgres /var/lib/postgresql/data
chmod 700 /var/lib/postgresql/data

echo "PostgreSQL Replica configurado com sucesso"