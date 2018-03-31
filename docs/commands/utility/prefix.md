title: Prefix
description: Shows or sets the command prefix.

# Prefix

## Description

Shows or sets the command prefix.

## Details

If no prefix is provided, the current prefix will be shown. If the prefix is "default", the prefix will be reset to the bot's default prefix. If the prefix is "none", the prefix will be removed entirely, only allowing mentions to run commands. Only administrators may change the prefix.

## Usage

### Format

`prefix [prefix/"default"/"none"]`

### Examples

* `prefix`
* `prefix -`
* `prefix omg!`
* `prefix default`
* `prefix none`

### Arguments

| Name   | Type   | Required | Minimum | Maximum |
|--------|--------|----------|---------|---------|
| Prefix | String | No       |         | 15      |
