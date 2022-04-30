mkdir -p /usr/local/bin/naufrage
cp .env.prod /usr/local/bin/naufrage/.env
cp -R target/release/* /usr/local/bin/naufrage/
mkdir -p /usr/local/bin/naufrage/static
cp -R static/dist/ /usr/local/bin/naufrage/static
cp fullchain.pem /usr/local/bin/naufrage/fullchain.pem
cp privkey.pem /usr/local/bin/naufrage/privkey.pem
echo "Installed successfully"