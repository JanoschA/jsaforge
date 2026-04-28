# AWS Lightsail Deployment

Diese Struktur orientiert sich bewusst am `sabrecommandtrainer`, ist aber auf `JSA Forge` angepasst.

Das Setup ist schlank gehalten:

- eine Ubuntu-Lightsail-Instanz
- ein App-Container fuer Frontend und API
- ein Caddy-Container fuer HTTPS und Reverse Proxy
- ein GitHub-Workflow fuer GHCR und den Lightsail-Deploy

## 1. Server vorbereiten

Lege eine kleine Ubuntu-Lightsail-Instanz an und oeffne mindestens:

- `SSH` auf Port `22`
- `HTTP` auf Port `80`
- `HTTPS` auf Port `443`

Lege am besten auch direkt eine statische IPv4 an.

## 2. Docker installieren

Per SSH auf den Server:

```bash
ssh -i "key.pem" ubuntu@YOUR_SERVER_IP
```

Dann Docker installieren:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
sudo mkdir -p /opt/jsa-forge/app
sudo chown -R ubuntu:ubuntu /opt/jsa-forge
```

Danach einmal neu verbinden und pruefen:

```bash
docker --version
docker compose version
```

## 3. Swap-Datei anlegen

Gerade bei kleineren Lightsail-Instanzen mit `1 GB RAM` ist eine Swap-Datei sinnvoll, damit Docker-Builds und Container stabiler laufen.

Per SSH auf der Instanz:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Damit bleibt die Swap-Datei auch nach einem Neustart aktiv.

## 4. Domain vorbereiten

Die Domain muss auf die Instanz zeigen, bevor Caddy automatisch TLS holen kann.

Trage deinen finalen Hostnamen spaeter ueber `SITE_HOSTNAME` in der Produktionsumgebung ein. Das [Caddyfile](./Caddyfile) nutzt diesen Wert dynamisch.

## 5. GitHub-Secrets anlegen

Lege im Repository mindestens diese Secrets an:

- `AWS_LIGHTSAIL_HOST`
- `AWS_LIGHTSAIL_USER`
- `AWS_LIGHTSAIL_SSH_KEY`
- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `SITE_HOSTNAME`
- `CONTACT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `DISCORD_LINK`

Hinweise:

- `CONTACT_EMAIL` wird sowohl fuer den Mail-Empfang als auch als Build-Wert fuer das sichtbare Kontakt-Mailto genutzt
- `DISCORD_LINK` wird als oeffentlicher Build-Wert ins Frontend uebernommen
- SMTP- und Turnstile-Secrets bleiben nur in der API bzw. in der Produktionsumgebung

## 6. Produktionsumgebung

Als Referenz liegt [`.env.production.example`](./.env.production.example) bei.

Im echten Deploy wird `.env.production` nicht eingecheckt, sondern vom GitHub-Workflow erzeugt und auf den Server kopiert.

## 7. Deployment-Ablauf

Der Workflow unter [../../../.github/workflows/deploy-lightsail.yml](../../../.github/workflows/deploy-lightsail.yml):

1. baut das Docker-Image
2. uebergibt die oeffentlichen Frontend-Werte als Docker-Build-Args
3. pushed das Image nach GHCR
4. synchronisiert das Repository nach `/opt/jsa-forge/app`
5. schreibt `deploy/aws/lightsail/.env.production`
6. startet [deploy.sh](./deploy.sh)

`deploy.sh` loggt sich bei GHCR ein, updated die Container und prueft `/api/healthz`.

## 8. Lokaler manueller Docker-Build

Wenn du ohne GitHub Actions lokal bauen willst, brauchst du die oeffentlichen Frontend-Werte beim Build:

```bash
docker build \
  --build-arg VITE_CONTACT_EMAIL=your@email.com \
  --build-arg VITE_DISCORD_LINK=https://discord.gg/your-link \
  -t jsa-forge-site .
```

Die privaten SMTP- und Turnstile-Werte gibst du weiterhin erst beim Container-Start bzw. ueber `.env.production` mit.
