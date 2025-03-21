echo "Deploying..."
pm2 start dist/site/app.js --name "opj" || echo "site run failed"