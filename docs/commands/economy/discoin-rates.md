title: Discoin rates
description: Lists the conversion rates for Discoin currencies
path: tree/master/commands/economy
source: discoin-rates.js

# Command

## Description

Lists the conversion rates for Discoin currencies

| Name        | Currency code | To Discoin | From Discoin |
|-------------|---------------|------------|--------------|
| Dice        | OAT           | 0.1        | 1            |
| DiscordTel  | DTS           | 1          | 0.9          |
| EliteLooter | ELT           | 0.9        | 1            |
| KekBot      | KEK           | 3          | 1            |
| Pollux      | RBN           | 0.9        | 0.95         |
| SmoreBot    | SBT           | 1          | 1            |

## Aliases

* `rates`
* `conversion-rates`
* `convert-rates`
* `discoinrates`
* `conversionrates`
* `convertrates`

## Usage

### Format

`convert-oats <amount> <currency to convert to>`

### Examples

* `convert-oats 500 dts`

### Arguments

| Name                   | Type   | Required |
|------------------------|--------|----------|
| Amount                 | Number | Yes      |
| Currency to convert to | Text   | Yes      |
