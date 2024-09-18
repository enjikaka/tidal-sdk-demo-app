build_service_worker:
	npx --yes esbuild service-worker/src/service-worker.js --bundle --minify --format=esm --target=es2023 --platform=browser --outfile=service-worker.built.js
	npx workbox-cli injectManifest workbox-config.cjs
	rm service-worker.built.js

build_app:
	node scripts/esbuild-app.js
	cp app/src/index.html dist/index.html
	cp app/src/fallback.svg dist/fallback.svg
	cp app/src/icons.svg dist/icons.svg
	node scripts/update-paths.js
	rm metafile.json

build: build_app build_service_worker

serve: build_app build_service_worker
	npx http-server dist -p 1337
