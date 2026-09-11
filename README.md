# GoalMind AI — Virtual Football Prediction Prototype

This is a front-end prototype that includes:
- Landing page
- Registration/login demo using browser localStorage
- Dashboard
- Screenshot upload and preview
- Basic odds-implied probability prediction engine
- Prediction history

## Run it
Open `index.html` in a browser, or serve the folder with any static web server.

## Important
The authentication is demo-only and is NOT production security. The prediction engine currently uses decimal odds entered by the user and normalizes implied probabilities. It does not claim guaranteed results and does not contain a hidden betting API.

## Production upgrade
For a real deployment, add a backend (e.g. Next.js API routes + Supabase), secure authentication, server-side image/OCR processing, a properly trained model, prediction/result auditing, rate limits, and payment handling if monetization is added.
