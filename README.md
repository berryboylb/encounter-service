# 🚀 Encounter Service

## 🌟 Introduction

This is demo encounter service

## Environment Variables
```
MONGO_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
MAIL_MAILER=
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=
MAIL_FROM_ADDRESS=
```


### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone https://github.com/berryboylb/encounter-service`
- Navigate: `cd encounter-service`
- Install dependencies: `npm install`

#### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `npm start:dev`
- Building: `npm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`



