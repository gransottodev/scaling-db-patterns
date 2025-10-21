<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🚀 Scaling Patterns - NestJS

Projeto de estudo implementando padrões de escalabilidade com NestJS, demonstrando técnicas essenciais para construir aplicações de alta performance e disponibilidade.

## 📋 Descrição

Este projeto implementa uma API REST de gerenciamento de produtos utilizando **padrões de escalabilidade** modernos, incluindo **Cache Aside** com Redis e **Replicação Master-Slave** de banco de dados PostgreSQL.

## 🎯 Padrões de Escalabilidade Implementados

### 1. 💾 Cache Aside com Redis

**O que é?**
- Padrão onde a aplicação gerencia o cache de forma explícita
- Os dados são buscados do cache primeiro; se não existirem (Cache Miss), busca-se do banco de dados

**Benefícios:**
- ⚡ **Redução de latência**: Respostas até 100x mais rápidas em Cache Hit
- 📉 **Menor carga no banco**: Reduz consultas repetidas ao PostgreSQL
- 💰 **Economia de recursos**: Menos processamento e I/O no banco de dados
- 🔄 **Controle total**: A aplicação decide quando invalidar o cache

**Como funciona no projeto:**
```typescript
// 1ª requisição GET /products → Cache Miss → Busca do banco → Salva no cache
// 2ª requisição GET /products → Cache Hit → Retorna do Redis (muito mais rápido!)
// POST /products → Cria produto → Invalida o cache automaticamente
```

**Configuração:**
- **Redis**: Cache em memória (porta 6379)
- **TTL**: 5 minutos (300 segundos)
- **Chave**: `products:all`

### 2. 🔁 Replicação Master-Slave (PostgreSQL)

**O que é?**
- Arquitetura com um banco **Master** (escrita) e um ou mais **Replicas** (leitura)
- Replicação streaming assíncrona do Master para Replica

**Benefícios:**
- 📊 **Escalabilidade horizontal**: Distribui carga de leitura entre múltiplas réplicas
- 🎯 **Separação de responsabilidades**: Escrita no Master, leitura nas Replicas
- 🛡️ **Alta disponibilidade**: Replica pode ser promovida a Master em caso de falha
- ⚖️ **Balanceamento de carga**: Múltiplas réplicas podem atender requisições de leitura

**Como funciona no projeto:**
```typescript
// POST /products → Escreve no Master (porta 5432)
// GET /products → Lê da Replica (porta 5433)
// Replicação acontece automaticamente via WAL (Write-Ahead Logging)
```

**Configuração:**
- **PostgreSQL Master**: Escrita (porta 5432)
- **PostgreSQL Replica**: Leitura (porta 5433)
- **Replicação**: Streaming com WAL

### 3. 📊 RedisInsight - Dashboard de Monitoramento

**O que é?**
- Interface visual oficial da Redis para monitorar e gerenciar cache

**Benefícios:**
- 👀 **Visualização em tempo real**: Veja as chaves e valores do cache
- 🔍 **Análise de TTL**: Monitore tempo de expiração dos dados
- 📈 **Métricas**: Acompanhe hits, misses e performance
- 🛠️ **Debug**: Execute comandos Redis manualmente

**Acesso:**
- URL: `http://localhost:5540`
- Conexão: `redis://scaling_redis:6379`

## 🏗️ Arquitetura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│       NestJS Application        │
│  ┌──────────┐    ┌───────────┐ │
│  │Controller│───▶│  Service  │ │
│  └──────────┘    └─────┬─────┘ │
│                        │        │
│         ┌──────────────┼───────────────┐
│         ▼              ▼               │
│    ┌────────┐    ┌──────────┐         │
│    │ Redis  │    │TypeORM   │         │
│    │ Cache  │    │Repository│         │
│    └────────┘    └────┬─────┘         │
└─────────────────────────┼──────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   ┌─────────┐      ┌──────────┐    ┌──────────┐
   │  Redis  │      │PostgreSQL│    │PostgreSQL│
   │         │      │  Master  │───▶│ Replica  │
   │(Cache)  │      │ (Write)  │    │  (Read)  │
   └─────────┘      └──────────┘    └──────────┘
   Port: 6379       Port: 5432      Port: 5433
```

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repo>
cd scaling-patterns

# 2. Instale as dependências
npm install

# 3. Suba os serviços Docker (Redis, PostgreSQL Master e Replica, RedisInsight)
docker compose up -d

# 4. Verifique se os serviços estão rodando
docker compose ps

# 5. Configure as variáveis de ambiente (já está criado o .env)
# Verifique o arquivo .env na raiz do projeto

# 6. Inicie a aplicação em modo desenvolvimento
npm run start:dev
```

### Variáveis de Ambiente

Arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300

# PostgreSQL Master (Escrita)
DB_MASTER_HOST=localhost
DB_MASTER_PORT=5432
DB_MASTER_USER=postgres
DB_MASTER_PASS=postgres_password

# PostgreSQL Replica (Leitura)
DB_SLAVE_HOST=localhost
DB_SLAVE_PORT=5433
DB_SLAVE_USER=postgres
DB_SLAVE_PASS=postgres_password

# Database
DB_NAME=scaling_db
```

## 📝 Testando a API

Use o arquivo `api.http` na raiz do projeto (extensão REST Client no VS Code):

```http
### Criar um produto (Cache será invalidado)
POST http://localhost:3000/products
Content-Type: application/json

{
  "name": "Product 1",
  "description": "Description for Product 1",
  "price": 100,
  "stock": 50
}

### Listar produtos (1ª vez: Cache Miss, 2ª vez: Cache Hit)
GET http://localhost:3000/products
```

## 🧪 Verificando o Cache

```bash
# Ver todas as chaves no Redis
docker exec -it scaling_redis redis-cli KEYS "*"

# Ver o valor de uma chave específica
docker exec -it scaling_redis redis-cli GET "products:all"

# Verificar TTL de uma chave
docker exec -it scaling_redis redis-cli TTL "products:all"

# Ou use o RedisInsight no navegador
# http://localhost:5540
```

## 🔍 Verificando a Replicação

```bash
# Conectar ao Master
docker exec -it scaling_postgres_master psql -U postgres -d scaling_db

# Verificar status da replicação (no Master)
SELECT client_addr, state, sent_lsn, write_lsn, sync_state 
FROM pg_stat_replication;

# Conectar à Replica
docker exec -it scaling_postgres_replica psql -U postgres -d scaling_db

# Verificar se está em recovery mode (no Replica)
SELECT pg_is_in_recovery();

# Verificar lag da replicação (no Replica)
SELECT NOW() - pg_last_xact_replay_timestamp() AS replication_lag;
```

## 📊 Monitoramento

### RedisInsight
- Acesse: `http://localhost:5540`
- Adicione conexão: `redis://scaling_redis:6379`

### Logs da Aplicação
```bash
# Ver logs em tempo real
npm run start:dev

# Busque por:
# - "Cache Hit" → Dados retornados do cache
# - "Cache Miss" → Dados buscados do banco
# - "Cache invalidated" → Cache foi limpo
```

## 🛠️ Comandos Docker Úteis

```bash
# Subir todos os serviços
docker compose up -d

# Ver logs de todos os serviços
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f redis
docker compose logs -f postgres_master

# Parar todos os serviços
docker compose down

# Parar e remover volumes (limpar todos os dados)
docker compose down -v

# Reiniciar um serviço específico
docker compose restart redis
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 🎯 Melhorias Futuras

Este projeto já apresenta uma **estrutura robusta** para aplicações simples e soluciona diversos problemas de **escalabilidade** e **disponibilidade**. No entanto, existem várias otimizações que poderiam ser implementadas para cenários mais complexos:

### 1. 🔥 Cache de Produtos Mais Acessados
- Implementar cache individual por produto (ex: `product:{id}`)
- Estratégia de **Cache LRU** (Least Recently Used) para produtos populares
- Cache com TTL diferenciado baseado em popularidade
- Métricas de hit rate por produto para análise de performance

### 2. 📄 Paginação para Consulta de Múltiplos Produtos
- Implementar paginação com `limit` e `offset`
- Cache por página (ex: `products:page:1`, `products:page:2`)
- Cursor-based pagination para melhor performance em datasets grandes
- Metadados de paginação (total de items, total de páginas, etc.)

### 3. 🔄 Failover Automático e Alta Disponibilidade
- **Lógica de elegibilidade** para promover Replica a Master automaticamente
- Implementar health checks e monitoramento contínuo
- Adicionar múltiplas Replicas para maior redundância
- Configurar **Patroni** ou **Repmgr** para gerenciamento automático de failover
- Load balancer entre múltiplas Replicas (ex: HAProxy, PgBouncer)

### 4. 📊 Outras Melhorias
- Rate limiting para proteção contra abuso
- Compressão de dados no cache
- Monitoramento com Prometheus e Grafana
- Logs estruturados com ELK Stack
- Circuit breaker para resiliência
- Testes de carga e benchmarks

---

## ✅ Considerações Finais

Apesar das melhorias sugeridas, este projeto já apresenta:

✔️ **Arquitetura escalável** com separação de leitura/escrita  
✔️ **Cache eficiente** com Redis reduzindo latência e carga no banco  
✔️ **Replicação de dados** garantindo disponibilidade  
✔️ **Monitoramento visual** com RedisInsight  
✔️ **Base sólida** para aplicações de produção de pequeno a médio porte  

Esta implementação é adequada para **aplicações simples e médias**, resolvendo os principais desafios de escalabilidade e disponibilidade de forma eficaz. Para aplicações de grande porte ou com requisitos específicos, as melhorias sugeridas acima podem ser implementadas gradualmente conforme a necessidade.

---
