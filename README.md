# CCTU bot

[![Build Status](https://travis-ci.com/OlegWock/cctu_bot.svg?token=8L1e4r6y3oPgeGWRXdkV&branch=master)](https://travis-ci.com/OlegWock/cctu_bot)

> Small bot for shedule and replaces posting from shitty college site to telegram

This bot was developed for educational purpose.

## Features

Bot can post schedule of lessons (`/cday` for today's schedule and `/nday` for tomorrow's schedule), pull replaces from site (image) and post it to group/dm. Also this bot can choose random student from `students.json` file. 

## How to build

There are two options to build bot. First of all, you need to create `.env` file, something like this:

```
TELEGRAM_BOT_TOKEN=your_telegram_token_without_quotes
```

Then you can create Docker container. 

```
# docker-compose up -d           # -d for detach
```

Done!

Or you can install dependencies and run bot locally:

```
yarn install
```

And run it

```
node index.js
```

You're awesome!