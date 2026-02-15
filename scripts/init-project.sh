#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Project Initialization Script
# Personalizes this template for your new project.
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "=========================================="
echo "  NestJS Hexagonal Modulith - Project Init"
echo "=========================================="
echo ""

# ---- Prompts ----

read -rp "Project name (e.g. my-awesome-api): " PROJECT_NAME
if [[ -z "$PROJECT_NAME" ]]; then
  echo "Error: Project name is required." >&2
  exit 1
fi

DEFAULT_DB_NAME=$(echo "$PROJECT_NAME" | tr '-' '_')
read -rp "Database name [${DEFAULT_DB_NAME}]: " DATABASE_NAME
DATABASE_NAME="${DATABASE_NAME:-$DEFAULT_DB_NAME}"

read -rp "API title (e.g. My Awesome API) [${PROJECT_NAME}]: " API_TITLE
API_TITLE="${API_TITLE:-$PROJECT_NAME}"

read -rp "Port [3000]: " PORT
PORT="${PORT:-3000}"

echo ""
echo "Configuration:"
echo "  Project name:  $PROJECT_NAME"
echo "  Database name: $DATABASE_NAME"
echo "  API title:     $API_TITLE"
echo "  Port:          $PORT"
echo ""
read -rp "Proceed? [Y/n] " CONFIRM
CONFIRM="${CONFIRM:-Y}"
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "Applying changes..."

# ---- Replacements ----

# package.json — project name
sed -i.bak "s/\"nestjs-hexagonal-modulith\"/\"${PROJECT_NAME}\"/" "$PROJECT_DIR/package.json"

# .env.example — database name and port
sed -i.bak "s/base_api/${DATABASE_NAME}/g" "$PROJECT_DIR/.env.example"
sed -i.bak "s/^PORT=3000$/PORT=${PORT}/" "$PROJECT_DIR/.env.example"

# docker-compose.yml — database name
sed -i.bak "s/base_api/${DATABASE_NAME}/g" "$PROJECT_DIR/docker-compose.yml"

# main.ts — API title in Swagger
sed -i.bak "s/.setTitle('API Documentation')/.setTitle('${API_TITLE}')/" "$PROJECT_DIR/src/main.ts"
sed -i.bak "s/customSiteTitle: 'API Documentation'/customSiteTitle: '${API_TITLE}'/" "$PROJECT_DIR/src/main.ts"

# Dockerfile — port
if [[ "$PORT" != "3000" ]]; then
  sed -i.bak "s/EXPOSE 3000/EXPOSE ${PORT}/g" "$PROJECT_DIR/Dockerfile"
fi

# ---- Cleanup ----

# Remove sed backup files
find "$PROJECT_DIR" -name "*.bak" -type f -delete

# Remove any existing migration files (users generate their own)
find "$PROJECT_DIR/src/shared/infrastructure/database/migrations" -name "*.ts" -type f ! -name ".gitkeep" -delete 2>/dev/null || true

# Remove this init script
rm -f "$0"

echo ""
echo "Done! Next steps:"
echo ""
echo "  1. cp .env.example .env"
echo "  2. pnpm install"
echo "  3. pnpm run docker:dev"
echo "  4. pnpm run migration:generate -- src/shared/infrastructure/database/migrations/InitialSchema"
echo "  5. pnpm run migration:run"
echo "  6. pnpm run seed"
echo "  7. pnpm run start:dev"
echo ""
echo "Happy coding!"
