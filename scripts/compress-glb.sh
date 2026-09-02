#!/usr/bin/env bash
# Télécharge les GLB Herkules et les compresse (Draco + textures 1024) dans public/models/
set -euo pipefail
cd "$(dirname "$0")/.."
BASE="https://www.herkules-fitness.com/wp-content/uploads/2026/04"
IMG="https://www.herkules-fitness.com/wp-content/uploads/2025/01"
TMP="$(mktemp -d)"
mkdir -p public/models public/assets/configurateur public/draco

# bash 3 (macOS) ne supporte pas declare -A : deux tableaux indexés parallèles
IDS=(HE-01 HE-02 HE-03 HE-04 HE-05 HE-06 HE-07 HE-08 HE-09 USB-01)
NAMES=(
  HE-01-CHEST-PRESS HE-02-Epaules HE-03-Dead-Lift HE-04-Pull-Down HE-05-Papillon
  HE-06-Cuisses HE-07-Leg-Press HE-08-Squat HE-09-Bench-Press USB-01-Velo-Elliptique
)

for i in "${!IDS[@]}"; do
  id="${IDS[$i]}"
  name="${NAMES[$i]}"
  echo "→ $id"
  curl -fsSL "$BASE/$name.glb" -o "$TMP/$id.glb"
  npx gltf-transform optimize "$TMP/$id.glb" "public/models/$id.glb" \
    --compress draco --texture-size 1024 --simplify false
  curl -fsSL "$IMG/$id.webp" -o "public/assets/configurateur/$id.webp"
done

# décodeur Draco servi localement (la CSP interdit le CDN Google)
cp node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.js \
   node_modules/three/examples/jsm/libs/draco/gltf/draco_decoder.wasm \
   node_modules/three/examples/jsm/libs/draco/gltf/draco_wasm_wrapper.js \
   public/draco/

rm -rf "$TMP"
ls -la public/models
