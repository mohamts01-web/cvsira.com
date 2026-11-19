$ErrorActionPreference='Stop'
$env:VITE_PRICING_PREVIEW='true'
$env:VITE_JOB_FIXTURES='true'
$env:VITE_EMAIL_LOGIN_READY='true'
$env:VITE_SUPABASE_URL='https://elmam-preview.invalid'
$env:VITE_SUPABASE_PUBLISHABLE_KEY='fixture-key'
$env:VITE_ETMAM_API_URL='/mock'
node node_modules/vite/bin/vite.js build --outDir dist-netlify-review *> anchor-build.log
if($LASTEXITCODE -ne 0){Get-Content anchor-build.log -Tail 15;throw 'Build failed'}
$env:ELMAM_BUILD_DIR='dist-netlify-review'
node scripts/build-search-pages.mjs
if($LASTEXITCODE -ne 0){throw 'Public pages failed'}
node scripts/package-preview.mjs
if($LASTEXITCODE -ne 0){throw 'Packaging failed'}
$zip=Join-Path (Get-Location) 'anchor-preview.zip'
Compress-Archive -Path 'dist-netlify-review/*' -DestinationPath $zip -Force
node scripts/upload-preview.mjs
if($LASTEXITCODE -ne 0){throw 'Preview upload failed'}

