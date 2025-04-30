FROM postgres:latest

# Install pg_cron
RUN apt-get update && apt-get install -y postgresql-17-cron

ENV HOME=/var/lib/postgresql
ENV PGHOST=127.0.0.1

# Build-time argument for .pgpass content
ARG PGPASS

# Create pg_cron dir and write .pgpass file using env var
RUN mkdir -p /var/lib/postgresql/pg_cron && \
    echo "$PGPASS" > /var/lib/postgresql/pg_cron/.pgpass && \
    chown postgres:postgres /var/lib/postgresql/pg_cron/.pgpass && \
    chmod 600 /var/lib/postgresql/pg_cron/.pgpass