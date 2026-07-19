#!/usr/bin/env bash
# Lighthouse performance report per page against the production (adapter-static) build.
set -u
cd "$(dirname "$0")/.."

PORT=4178
DBG=9222
OUT="lighthouse-reports"
BASE="http://localhost:${PORT}"
export CHROME_PATH="/usr/bin/google-chrome-stable"
CHROME_FLAGS="--headless=new --no-sandbox --disable-dev-shm-usage --disable-gpu"

# name|url-path  (trailing slash required by trailingSlash:'always'; 404 via bogus path)
ROUTES=(
  "home|/home/"
  "docs|/docs/"
  "models|/models/"
  "pricing|/pricing/"
  "status|/status/"
  "quickstart|/quickstart/"
  "setup-index|/setup/"
  "setup-guide-aider|/setup/aider/"
  "roleplay-api|/roleplay-api/"
  "coding-agent-api|/coding-agent-api/"
  "openai-compatible-api|/openai-compatible-api/"
  "team|/team/"
  "support|/support/"
  "privacy|/privacy/"
  "terms|/terms/"
  "what-is-free-the-ai|/what-is-free-the-ai/"
  "404|/__nonexistent-lh-probe/"
)

echo ">> building production site"
pnpm run build >/tmp/lh-build.log 2>&1 || { echo "BUILD FAILED"; tail -20 /tmp/lh-build.log; exit 1; }

echo ">> starting vite preview on :${PORT}"
pnpm exec vite preview --host 127.0.0.1 --port "${PORT}" --strictPort >/tmp/lh-preview.log 2>&1 &
PREVIEW_PID=$!
trap 'kill $PREVIEW_PID $CHROME_PID 2>/dev/null' EXIT
for i in $(seq 1 30); do
  curl -sf "${BASE}/home/" -o /dev/null && break
  sleep 0.5
done

echo ">> launching shared headless Chrome on :${DBG}"
"$CHROME_PATH" $CHROME_FLAGS --remote-debugging-port="${DBG}" about:blank >/tmp/lh-chrome.log 2>&1 &
CHROME_PID=$!
for i in $(seq 1 30); do
  curl -sf "http://127.0.0.1:${DBG}/json/version" -o /dev/null && break
  sleep 0.5
done

rm -rf "${OUT}"; mkdir -p "${OUT}"
echo "page,performance,fcp_ms,lcp_ms,tbt_ms,cls,si_ms,tti_ms" > "${OUT}/summary.csv"

for entry in "${ROUTES[@]}"; do
  name="${entry%%|*}"; path="${entry##*|}"
  echo ">> lighthouse: ${name} (${path})"
  npx --yes lighthouse "${BASE}${path}" \
    --port="${DBG}" \
    --only-categories=performance \
    --form-factor=mobile \
    --output=html --output=json \
    --output-path="${OUT}/${name}" \
    --quiet --max-wait-for-load=60000 \
    --chrome-flags="${CHROME_FLAGS}" >/dev/null 2>>"${OUT}/lighthouse.err"
  node -e '
    const fs=require("fs");
    const f=process.argv[1];
    try{
      const r=JSON.parse(fs.readFileSync(f,"utf8"));
      const a=r.audits, cat=r.categories.performance;
      const m=id=>a[id]&&a[id].numericValue!=null?Math.round(a[id].numericValue):"";
      const row=[process.argv[2],
        cat.score!=null?Math.round(cat.score*100):"ERR",
        m("first-contentful-paint"),m("largest-contentful-paint"),
        m("total-blocking-time"),
        a["cumulative-layout-shift"]?(+a["cumulative-layout-shift"].numericValue).toFixed(3):"",
        m("speed-index"),m("interactive")];
      fs.appendFileSync(process.argv[3], row.join(",")+"\n");
      console.log("   "+process.argv[2]+": perf="+row[1]+" LCP="+row[3]+"ms TBT="+row[4]+"ms CLS="+row[5]);
    }catch(e){ fs.appendFileSync(process.argv[3], process.argv[2]+",ERR,,,,,,\n"); console.log("   "+process.argv[2]+": ERROR "+e.message); }
  ' "${OUT}/${name}.report.json" "${name}" "${OUT}/summary.csv"
done

echo ">> DONE. Reports in ${OUT}/"
