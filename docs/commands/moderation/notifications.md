title: Notifications
description: Check or set what notifications for server events are sent to a channel.
path: tree/master/commands/mod
source: notifications.js

# Notifications

## Description

Check or set what notifications for server events are sent to a channel.

## Details

Not specifying an event type to toggle will list the statuses of all events in the channel

## Aliases

* `notification`
* `notify`
* `alerts`
* `server-notifications`
* `server-notification`
* `server-notify`
* `server-alerts`
* `servernotifications`
* `servernotification`
* `servernotify`
* `serveralerts`

## Usage

### Format

`notifications [notification]`

### Examples

* `notifications 1`
* `notifications`

### Arguments

| Name         | Type    | Required | Minimum | Maximum |
|--------------|---------|----------|---------|---------|
| Notification | Integer | No       | 1       | 4       |
