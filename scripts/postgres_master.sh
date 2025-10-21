#!/bin/bash
set -e

# Aguardar o PostgreSQL inicializar
until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  echo "Aguardando PostgreSQL inicializar..."
  sleep 2
done

# Criar usuário de replicação
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$POSTGRES_REPLICATION_USER') THEN
            CREATE USER $POSTGRES_REPLICATION_USER WITH REPLICATION ENCRYPTED PASSWORD '$POSTGRES_REPLICATION_PASSWORD';
        END IF;
    END
    \$\$;
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO $POSTGRES_REPLICATION_USER;
EOSQL

# Configurar postgresql.conf para replicação
echo "# Configurações para replicação adicionadas pelo script" >> /var/lib/postgresql/data/postgresql.conf
echo "wal_level = replica" >> /var/lib/postgresql/data/postgresql.conf
echo "max_wal_senders = 10" >> /var/lib/postgresql/data/postgresql.conf
echo "max_replication_slots = 10" >> /var/lib/postgresql/data/postgresql.conf
echo "synchronous_commit = off" >> /var/lib/postgresql/data/postgresql.conf
echo "archive_mode = on" >> /var/lib/postgresql/data/postgresql.conf
echo "archive_command = '/bin/true'" >> /var/lib/postgresql/data/postgresql.conf
echo "hot_standby = on" >> /var/lib/postgresql/data/postgresql.conf
echo "listen_addresses = '*'" >> /var/lib/postgresql/data/postgresql.conf

# Configurar pg_hba.conf para permitir replicação
echo "# Permitir replicação da rede Docker" >> /var/lib/postgresql/data/pg_hba.conf
echo "host replication $POSTGRES_REPLICATION_USER 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host replication $POSTGRES_REPLICATION_USER 172.16.0.0/12 md5" >> /var/lib/postgresql/data/pg_hba.conf
echo "host all all 0.0.0.0/0 md5" >> /var/lib/postgresql/data/pg_hba.conf

# Recarregar configuração
pg_ctl reload -D /var/lib/postgresql/data

echo "PostgreSQL Master configurado para replicação"