#!/bin/bash
# =========================================================
# DietHub - One Command Startup Script
# =========================================================
# Usage: ./run.sh
# =========================================================

# =========================================================
# CONFIGURATION - Change these values as needed
# =========================================================
CONDA_PATH="/opt/anaconda3"                                # Conda installation path (system conda)
CONDA_ENV_PATH="/Users/byron/opt/anaconda3/envs/ODLG4"    # Full path to conda environment
DEMO_MODE=false                                   # true = demo mode, false = use real ML model
BACKEND_PORT=8000                                 # Backend server port
FRONTEND_PORT=5173                                # Frontend dev server port
OLLAMA_MODEL="llama2:7b-chat"                    # Ollama model for explanations (run: ollama serve & ollama pull llama2:7b-chat)
# =========================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
API_FILE="$FRONTEND_DIR/src/services/api.js"
PID_FILE="$PROJECT_DIR/.run.pid"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

activate_conda_env() {
    log_info "Activating conda environment: $CONDA_ENV_PATH"
    eval "$($CONDA_PATH/bin/conda shell.bash hook)"
    conda activate "$CONDA_ENV_PATH"
    
    if [ $? -eq 0 ]; then
        log_success "Conda environment activated successfully"
    else
        log_error "Failed to activate conda environment"
        exit 1
    fi
}

cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null && log_info "Stopped process $pid"
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    
    pkill -f "python main.py" 2>/dev/null || true
    pkill -f "uvicorn" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    log_success "All services stopped"
    exit 0
}
trap cleanup SIGINT SIGTERM

check_conda() {
    if [ ! -d "$CONDA_ENV_PATH" ]; then
        log_error "Conda environment not found at: $CONDA_ENV_PATH"
        log_info "Available environments:"
        conda info --envs
        exit 1
    fi
}

check_node() {
    if ! command -v node &>/dev/null; then
        log_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    if ! command -v npm &>/dev/null; then
        log_error "npm is not found. Please install npm or Node.js."
        exit 1
    fi
}

update_demo_mode() {
    local mode=$1
    
    if [ "$mode" = "true" ]; then
        sed -i.bak 's/const DEMO_MODE = false/const DEMO_MODE = true/' "$API_FILE" 2>/dev/null || \
        sed -i '' 's/const DEMO_MODE = false/const DEMO_MODE = true/' "$API_FILE" 2>/dev/null
        log_info "Demo mode ENABLED (using keyword-based prediction)"
    else
        sed -i.bak 's/const DEMO_MODE = true/const DEMO_MODE = false/' "$API_FILE" 2>/dev/null || \
        sed -i '' 's/const DEMO_MODE = true/const DEMO_MODE = false/' "$API_FILE" 2>/dev/null
        log_info "Demo mode DISABLED (using real ML model via backend)"
    fi
    
    rm -f "$API_FILE.bak" 2>/dev/null
}

wait_for_backend() {
    local max_attempts=90
    local attempt=0
    
    echo -e "\n${YELLOW}⏳ Waiting for backend to be ready...${NC}"
    echo -e "${CYAN}   (This may take 30-60 seconds on first run to load the model)${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:$BACKEND_PORT/health" >/dev/null 2>&1; then
            echo ""
            log_success "Backend ready at http://localhost:$BACKEND_PORT"
            return 0
        fi
        
        attempt=$((attempt + 1))
        printf "\r   Attempt $attempt/$max_attempts..."
        sleep 2
    done
    
    echo ""
    log_error "Backend failed to start within $((max_attempts * 2)) seconds"
    return 1
}

start_backend() {
    log_info "Installing backend dependencies..."
    /Users/byron/opt/anaconda3/envs/ODLG4/bin/pip install -r "$BACKEND_DIR/requirements.txt" --quiet 2>/dev/null || \
    /Users/byron/opt/anaconda3/envs/ODLG4/bin/pip install -r "$BACKEND_DIR/requirements.txt"
    
    log_info "Starting backend server..."
    log_info "Backend logs: tail -f $PROJECT_DIR/backend.log"
    cd "$BACKEND_DIR" && /Users/byron/opt/anaconda3/envs/ODLG4/bin/python main.py > "$PROJECT_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID >> "$PID_FILE"
    
    if ! wait_for_backend; then
        log_error "Failed to start backend"
        log_info "Check errors: tail -50 $PROJECT_DIR/backend.log"
        return 1
    fi
}

start_frontend() {
    log_info "Starting frontend dev server..."
    cd "$FRONTEND_DIR" && npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID >> "$PID_FILE"
    
    sleep 3
    log_success "Frontend ready at http://localhost:$FRONTEND_PORT"
}

print_banner() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC}      ${BOLD}DietHub - NLP Sugar Prediction${NC}      ${CYAN}║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║${NC}  🍎  Predict sugar in your recipes       ${CYAN}║${NC}"
    echo -e "${CYAN}║${NC}  🧪  Powered by DistilBERT model          ${CYAN}║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
}

print_summary() {
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ✅ All services running!${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo -e "  ${BOLD}Frontend:${NC}  http://localhost:$FRONTEND_PORT"
    echo -e "  ${BOLD}Backend:${NC}   http://localhost:$BACKEND_PORT"
    echo -e "  ${BOLD}Mode:${NC}      $([ "$DEMO_MODE" = "true" ] && echo "Demo (keyword-based)" || echo "Real ML (DistilBERT)")"
    echo ""
    echo -e "  ${YELLOW}Backend logs:${NC} tail -f $PROJECT_DIR/backend.log"
    echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
    echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
    echo ""
}

main() {
    clear
    print_banner
    
    check_node
    
    echo -e "${YELLOW}Configuration:${NC}"
    echo -e "  Conda Env:   $CONDA_ENV_PATH"
    echo -e "  Demo Mode:  $DEMO_MODE"
    echo -e "  Backend:     localhost:$BACKEND_PORT"
    echo -e "  Frontend:    localhost:$FRONTEND_PORT"
    echo -e "  ${BOLD}Ollama:${NC}    localhost:11434 (manual: ollama serve && ollama pull $OLLAMA_MODEL)"
    echo ""
    
    update_demo_mode "$DEMO_MODE"
    
    if [ "$DEMO_MODE" = "false" ]; then
        start_backend
    else
        log_warn "Running in DEMO MODE - no backend needed"
        log_info "Starting frontend..."
    fi
    
    start_frontend
    print_summary
    
    wait
}

main "$@"
