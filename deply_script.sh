sw-precache --config=sw-precache-config.json --verbose --no-handle-fetch

cp index.html public
cp favicon.ico public
cp manifest.json public
cp service-worker.js public
cp -r images public
cp -r scripts public
cp -r styles public

firebase deploy