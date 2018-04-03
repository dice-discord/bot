title: Server status
description: Get information about a Minecraft server.
path: tree/master/commands/minecraft
source: server-status.js

# Server status

## Description

Get information about a Minecraft server.

## Aliases

* `mc-server`
* `minecraft-server`
* `mc-server-status`
* `minecraft-server-status`
* `serverstatus`
* `mcserver`
* `minecraftserver`
* `mcserverstatus`
* `minecraftserverstatus`

## Usage

### Format

`server-status <ip> [port]`

### Examples

* `server-status us.mineplex.com`
* `server-status 127.0.0.1 25565`

### Arguments

| Name       | Type    | Required | Minimum | Maximum |
|------------|---------|----------|---------|---------|
| IP address | String  | Yes      |         |         |
| Port       | Integer | No       | 1       | 65535   |
