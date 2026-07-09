#!/usr/bin/env bash
# ============================================================================
# graph-deps.sh — Render the Z-ai ID-graph as SVG + PNG via graphviz
# ============================================================================
#
# USAGE
#   bash standards/scripts/graph-deps.sh                   # default: docs/_graph/
#   bash standards/scripts/graph-deps.sh --out=/tmp/x      # custom output dir
#   bash standards/scripts/graph-deps.sh --dot-only        # emit DOT only
#   bash standards/scripts/graph-deps.sh --open            # also xdg-open SVG
#
# OUTPUT (in OUT_DIR, default $PLATFORM_DIR/docs/_graph/)
#   id-graph.svg   — vector graph (browsable in browser, zoomable)
#   id-graph.png   — raster preview (for embedding in README/docs)
#   id-graph.dot   — DOT source (for diffing in CI)
#
# AUTOMATION
#   CI runs this script on every push to main, every PR, and nightly at
#   03:00 UTC. Output is uploaded as a 30-day-retention artifact named
#   "id-graph". See .github/workflows/verify-id-graph.yml.
#
# DATA SOURCE
#   Calls `node standards/scripts/verify-id-graph.js --json` to get the
#   authoritative node list, then re-parses the .md source files to extract
#   Related:/Aligned_with: edges (the JSON output does not currently dump
#   edges — only counts). Same ID_REGEX as verify-id-graph.js.
#
# LAYOUT
#   Left-to-right (LR) to fit wide screens. Each layer is a subgraph cluster:
#     L1 Standards  (STD-*)      — blue
#     L2 Guard      (RULE-*)     — amber
#     L3 Skills     (ZAI-*)      — green
#   Nodes with no edges are shown in a grey "orphans" cluster at the bottom.
#
# REQUIRES
#   - node (already used by verify-id-graph.js)
#   - graphviz `dot` binary (already installed at /usr/bin/dot)
#
# EXIT CODES
#   0 — graph rendered (or DOT emitted with --dot-only)
#   1 — rendering failed
#   2 — prerequisites missing
# ============================================================================

set -euo pipefail

# PLATFORM_DIR = the Z-ai-platform checkout (parent of this script's
# standards/ submodule). Works for:
#   - sandbox:        /home/z/my-project/Z-ai-platform/standards/scripts/graph-deps.sh
#   - CI checkout:    $GITHUB_WORKSPACE/standards/scripts/graph-deps.sh
#   - standalone dev: anywhere — pass --platform=<path> to override
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLATFORM_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# OUT_DIR = where SVG/PNG/DOT land. Default: $PLATFORM_DIR/docs/_graph/
# (kept inside the repo so it's browsable on GitHub UI).
# Override with --out=<path> or env GRAPH_OUT_DIR.
OUT_DIR="${GRAPH_OUT_DIR:-${PLATFORM_DIR}/docs/_graph}"

VERIFY="${PLATFORM_DIR}/standards/scripts/verify-id-graph.js"

# --- preflight --------------------------------------------------------------
if [ ! -f "$VERIFY" ]; then
  echo "[graph-deps] verify-id-graph.js not found at $VERIFY"
  exit 2
fi
if ! command -v node >/dev/null 2>&1; then
  echo "[graph-deps] node not found in PATH"
  exit 2
fi
if ! command -v dot >/dev/null 2>&1; then
  echo "[graph-deps] graphviz 'dot' not found in PATH"
  echo "[graph-deps] install: apt-get install -y graphviz"
  exit 2
fi


OPEN_FLAG=0
DOT_ONLY=0
for arg in "$@"; do
  case "$arg" in
    --open) OPEN_FLAG=1 ;;
    --dot-only) DOT_ONLY=1 ;;
    --platform=*) PLATFORM_DIR="${arg#--platform=}" ;;
    --out=*) OUT_DIR="${arg#--out=}" ;;
    *) echo "[graph-deps] unknown flag: $arg"; exit 2 ;;
  esac
done

# Create output directory AFTER argument parsing (so --out= override is honored)
mkdir -p "$OUT_DIR"

# --- step 1: extract graph data via verify-id-graph.js --json ---------------
echo "[graph-deps] step 1/3: extracting ID graph from verify-id-graph.js ..."
JSON_TMP="$(mktemp /tmp/zai-graph-XXXXXX.json)"
trap 'rm -f "$JSON_TMP"' EXIT

if ! node "$VERIFY" --json > "$JSON_TMP" 2>/dev/null; then
  echo "[graph-deps] FAILED: verify-id-graph.js did not exit 0"
  node "$VERIFY" --json
  exit 1
fi

# --- step 2: transform JSON -> DOT ------------------------------------------
echo "[graph-deps] step 2/3: transforming to DOT ..."
DOT_FILE="${OUT_DIR}/id-graph.dot"

# Use lib/graph-transform.cjs for JSON->DOT transformation
TRANSFORM_JS="${SCRIPT_DIR}/lib/graph-transform.cjs"
if [ ! -f "$TRANSFORM_JS" ]; then
  echo "[graph-deps] ERROR: $TRANSFORM_JS not found"
  exit 1
fi
node "$TRANSFORM_JS" "$JSON_TMP" "$DOT_FILE" "$PLATFORM_DIR"

if [ "$DOT_ONLY" -eq 1 ]; then
  echo "[graph-deps] --dot-only: DOT written to $DOT_FILE"
  exit 0
fi

# --- step 3: render DOT -> SVG + PNG ----------------------------------------
echo "[graph-deps] step 3/3: rendering SVG + PNG ..."

SVG_FILE="${OUT_DIR}/id-graph.svg"
PNG_FILE="${OUT_DIR}/id-graph.png"

if ! dot -Tsvg "$DOT_FILE" -o "$SVG_FILE" 2>/tmp/zai-graph-doterr.log; then
  echo "[graph-deps] dot -Tsvg failed:"
  cat /tmp/zai-graph-doterr.log
  exit 1
fi
echo "[graph-deps] SVG: $SVG_FILE ($(wc -c < "$SVG_FILE") bytes)"

# PNG render with overlap=false can be slow. Use a simpler layout for PNG.
# Skip if it takes > 30s (SVG is the primary deliverable).
echo "[graph-deps] rendering PNG (may take 10-30s) ..."
if ! timeout 30 dot -Tpng -Gdpi=110 "$DOT_FILE" -o "$PNG_FILE" 2>>/tmp/zai-graph-doterr.log; then
  echo "[graph-deps] WARNING: PNG render skipped (timeout or fail). SVG is still available."
  rm -f "$PNG_FILE"
else
  echo "[graph-deps] PNG: $PNG_FILE ($(wc -c < "$PNG_FILE") bytes)"
fi

echo ""
echo "[graph-deps] DONE."
echo "  SVG: $SVG_FILE"
echo "  PNG: $PNG_FILE"
echo "  DOT: $DOT_FILE"

if [ "$OPEN_FLAG" -eq 1 ] && command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$SVG_FILE" >/dev/null 2>&1 || true
fi
