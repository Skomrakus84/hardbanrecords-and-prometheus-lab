#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check and install global dependencies
check_global_dep() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${YELLOW}Installing $1 globally...${NC}"
        npm install -g $1 || {
            echo -e "${RED}Failed to install $1. Please install it manually.${NC}"
            exit 1
        }
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
    fi
}

# Function to install local dependencies
install_deps() {
    local dir=$1
    if [ ! -d "$dir/node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies in $dir...${NC}"
        (cd $dir && npm install) || {
            echo -e "${RED}Failed to install dependencies in $dir${NC}"
            exit 1
        }
    fi
}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   HardbanRecords Lab Development ENV   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# Check global dependencies
echo -e "\n${BLUE}Checking global dependencies...${NC}"
check_global_dep "pm2"
check_global_dep "nodemon"
check_global_dep "concurrently"

# Install local dependencies
echo -e "\n${BLUE}Checking local dependencies...${NC}"
install_deps "."
install_deps "./frontend"
install_deps "./backend"
install_deps "./backend/music"
install_deps "./backend/publishing"
install_deps "./backend/prometheus"

# Stop any running PM2 processes
echo -e "\n${BLUE}Cleaning up existing processes...${NC}"
pm2 delete all 2>/dev/null

# Start services using PM2
echo -e "\n${BLUE}Starting services...${NC}"
pm2 start ecosystem.config.js

# Wait for services to start
sleep 2

# Check service status
echo -e "\n${BLUE}Service Status:${NC}"
pm2 list

# Start development dashboard
echo -e "\n${GREEN}Development environment is ready!${NC}"
echo -e "Frontend: http://localhost:5173"
echo -e "API Gateway: http://localhost:3001"
echo -e "Music Service: http://localhost:3002"
echo -e "Publishing Service: http://localhost:3003"
echo -e "Prometheus Service: http://localhost:3004\n"

# Monitor services
echo -e "${BLUE}Starting PM2 monitoring...${NC}"
echo -e "${YELLOW}Press Q to exit monitoring${NC}\n"
pm2 monit