# 🍓 Recipe Diary

A recipe diary built as a serverless AWS application, combining a responsive web app with persistent recipe and image storage.

## Live Demo

https://d12r4gjrrz5jex.cloudfront.net

## Features

- 📖 Interactive cookbook-style UI
- 🔍 Recipe search and index
- ➕ Add, edit and delete recipes
- 🖼️ Recipe image uploads
- 💾 Persistent cloud storage
- 📱 Responsive design
- 📲 Installable PWA
- 🔐 Private S3 storage with presigned URLs
- ⚡ Serverless REST API

## ☁️ AWS Services

| Service | Purpose |
|---|---|
| Amazon S3 | Frontend hosting and private image storage |
| CloudFront | HTTPS delivery and CDN |
| API Gateway | REST API |
| AWS Lambda | Serverless backend |
| DynamoDB | Recipe persistence |
| IAM | Least-privilege access between services |

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Cloud:** AWS S3, CloudFront, API Gateway, Lambda, DynamoDB
- **PWA:** Web App Manifest, Service Worker
- **Development:** Git, GitHub

## 🔑 Key Implementation

- Replaced browser-only localStorage persistence with DynamoDB.
- Implemented CRUD operations through API Gateway and Lambda.
- Added presigned S3 URLs for secure image uploads and retrieval.
- Configured CloudFront with private S3 origin access.
- Added CORS configuration between the frontend, API and image storage.
- Converted the application into an installable PWA.

## 📸 Screenshots

See the `screenshots/` folder for the application, PWA and AWS infrastructure screenshots.

## 🚀 Deployment

The frontend is deployed through Amazon S3 + CloudFront, with the backend running entirely serverlessly through API Gateway + Lambda + DynamoDB.