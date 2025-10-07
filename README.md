# Password Generator + Secure Vault (MVP)

Fast, privacy-first web app to generate strong passwords and securely store them in a personal vault.

## Features
- **Password Generator:** adjustable length, letters/numbers/symbols, exclude look-alikes  
- **Vault:** add/edit/delete entries (title, username, password, URL, notes)  
- **Client-side encryption:** server never stores plaintext  
- **Copy to clipboard** with auto-clear in 10s  
- **Search/filter** vault items  
- **Auth:** email + password  

## Tech Stack
- **Frontend:** Next.js + TypeScript  
- **Backend:** Next.js API routes / Node.js  
- **Database:** MongoDB Atlas

## Setup
```bash
git clone https://github.com/aashish-mitt96/password-vault
npm install
