title: Ban user
description: Ban any user from your server.
path: tree/master/commands/mod
source: ban-user.js

# Ban user

## Description

Ban any user from your server.

!!! tip
    This command supports hackbans, where you ban a user that isn't on your server yet.

## Aliases

* `ban`
* `ban-member`
* `hackban-user`
* `hackban-member`
* `hackban`
* `banuser`
* `banmember`
* `hackbanuser`
* `hackbanmember`

## Usage

### Format

`ban-user <user> [reason for ban]`

### Examples

* `ban @Zoop`
* `ban 213041121700478976`
* `ban Zoop Spamming messages`

### Arguments

| Name           | Type   | Required | Minimum | Maximum |
|----------------|--------|----------|---------|---------|
| User           | User   | Yes      |         |         |
| Reason for ban | String | No       |         | 400     |
