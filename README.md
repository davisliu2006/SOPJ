# SOPJ

SOPJ stands for Simple Online Programming Judge.

The judge website is built with Express, TypeScript, and MariaDB. The sandbox environment runs in Docker containers.

## Prerequisites

- NodeJS (JavaScript Runtime)
- TypeScript Compiler
- MariaDB

For server-side hosting:
- PM2 Node Process Manager (`npm install -g pm2`)

For sandbox code executor:
- Docker Command Line Interface

## Setup

Set environment variables in `include/env.ts`:
```ts
export const DB_PASSWORD = "<db password>";
export const DB_USER = "<db user>";
export const DIR = "<project folder>/site";
export const HOSTNAME = "<host name>";
export const JUDGE_SUPPORT = true;
export const JWTSECRET = "<secret key for JWT encryption>";
export const PORT = <port>;
export const SESSIONSECRET = "<session secret key>";
```

Install node packages:
```
npm install
```

Test run web server:
```
npm run webserver
```

## MariaDB

Ensure the application has the correct permissions to access the database.

Check permissions:
```sql
SELECT host, user FROM mysql.user;
SHOW GRANTS FOR '<user>'@'<host>';
```

Set permissions:
```sql
CREATE USER '<user>'@'<host>' IDENTIFIED BY '<password>';
GRANT ALL PRIVILEGES ON <database>.* TO '<user>'@'<host>';
FLUSH PRIVILEGES;
```

## Docker

Ensure the application has access to Docker.

```
sudo usermod -aG docker <user>
```

Build compiler and runner images:

```
sudo docker build -t online_judge_compiler judge/compiler
sudo docker build -t online_judge_runner judge/runner
```

## Deployment

Setup:
```
sudo npm install -g pm2
```

Build:
```
source scripts/build.sh
```

Deploy:
```
source scripts/deploy.sh
```