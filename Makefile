.PHONY: build_service_worker
build_service_worker:
	npx --yes esbuild service-worker/src/service-worker.js --bundle --minify --format=esm --target=es2023 --platform=browser --outfile=service-worker.built.js
	npx workbox-cli injectManifest workbox-config.cjs
	rm service-worker.built.js

.PHONY: build_app
build_app:
	node --env-file=.env scripts/esbuild-app.js
	cp app/src/index.html dist/index.html
	cp app/src/fallback.svg dist/fallback.svg
	cp app/src/icons.svg dist/icons.svg
	node scripts/update-paths.js
	rm metafile.json

.PHONY: build
build: build_app build_service_worker

.PHONY: serve
serve: build
	npx http-server dist -p 1337

.PHONY: serve
serve_docker:
	podman build -f Dockerfile -t enjikaka/tidal-sdk-demo-app
	podman run -p 1337:8000 enjikaka/tidal-sdk-demo-app
