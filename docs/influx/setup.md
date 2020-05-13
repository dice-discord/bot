# InfluxDB setup

These instructions are written for a fresh install of InfluxDB 1.8.

Any of the password fields should have their values copied over to the respective `.env` files.

- [`bot.env`](../../bot.env) `INFLUXDB_DSN` for the bot (user `dice`)
- [`telegraf.env`](../../telegraf.env) `INFLUXDB_PASSWORD` for Telegraf (user `telegraf`)

```sql
CREATE DATABASE dice

USE dice

-- This is used by the bot to write metrics
CREATE USER dice WITH PASSWORD 'password'

GRANT WRITE ON 'dice' TO 'dice'

-- This is used by Grafana to read data and display it
CREATE USER grafana WITH PASSWORD 'grafana_password'

GRANT READ ON 'dice' TO 'grafana'

CREATE DATABASE telegraf
-- This is used by Telegraf to record system metrics
CREATE USER telegraf WITH PASSWORD 'telegraf_password'
GRANT WRITE ON 'telegraf' TO 'telegraf'
```
