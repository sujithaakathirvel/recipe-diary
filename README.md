# 🍓 Recipe Diary

A serverless recipe diary built on AWS, combining a responsive web application with persistent recipe and image storage.

## 🌐 Live Demo

https://d12r4gjrrz5jex.cloudfront.net

## ✨ Features

- 📖 Interactive cookbook-style UI
- 🔍 Recipe search and index
- ➕ Add, edit and delete recipes
- 🖼️ Secure image uploads
- 💾 Persistent cloud storage
- 📱 Responsive design
- 📲 Installable PWA
- 🔐 Private S3 storage with presigned URLs
- ⚡ Serverless REST API

---

## ☁️ AWS Architecture

| Service | Purpose |
|---|---|
| Amazon S3 | Frontend hosting and private image storage |
| CloudFront | HTTPS delivery and CDN |
| API Gateway | REST API |
| AWS Lambda | Serverless backend |
| DynamoDB | Recipe persistence |
| IAM | Least-privilege service access |

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Cloud:** AWS S3, CloudFront, API Gateway, Lambda, DynamoDB
- **PWA:** Web App Manifest, Service Worker
- **Testing:** Apache JMeter, cURL, CloudWatch
- **Development:** Git, GitHub

---

## 🔑 Key Implementation

- Replaced browser-only `localStorage` persistence with DynamoDB
- Implemented CRUD operations through API Gateway and Lambda
- Added presigned S3 URLs for secure image uploads and retrieval
- Configured CloudFront with private S3 origin access
- Configured CORS between the frontend, API and image storage
- Converted the application into an installable PWA

---

## 📊 Performance & Validation

### API Benchmark

Measured using Apache JMeter against the deployed API.

| Endpoint | Requests | Throughput | Avg. Latency | Errors |
|---|---:|---:|---:|---:|
| `GET /recipes` | 50 | 14.2 req/s | 238 ms | 0% |
| `POST /recipes` | 10 | 5.6 req/s | 166 ms | 0% |
| `PUT /recipes/{id}` | 10 | 7.7 req/s | 117 ms | 0% |
| `DELETE /recipes/{id}` | 1 | 1.2 req/s | 713 ms | 0% |

> DELETE was intentionally measured as a single request because it is destructive.

### Image Transfer Benchmark

Measured direct uploads to private S3 using presigned URLs.

| Image Size | Upload Time | Retrieval Time | Upload | Retrieval |
|---|---:|---:|---:|---:|
| 100 KB | 157.950 ms | 121.114 ms | 200 | 200 |
| 500 KB | 432.605 ms | 166.549 ms | 200 | 200 |
| 1 MB | 170.542 ms | 218.239 ms | 200 | 200 |
| 2 MB | 421.630 ms | 304.727 ms | 200 | 200 |
| 5 MB | 510.494 ms | 354.543 ms | 200 | 200 |

- Upload success rate: **5/5 (100%)**
- Retrieval success rate: **5/5 (100%)**
- Presigned URL generation: **10/10 successful**
- Average presigned URL generation time: **77.610 ms**

### Lambda Observability

CloudWatch metrics captured during the benchmark window:

| Metric | Result |
|---|---:|
| Average Duration | 69.006 ms |
| Minimum Duration | 2.63 ms |
| Maximum Duration | 329.26 ms |
| Invocations | 32 |
| Errors | 0 |
| Throttles | 0 |

---

## 🔐 Security Validation

- S3 Public Access Block: **all four controls enabled**
- Unsigned public object request: **HTTP 403**
- Presigned application retrieval: **HTTP 200**
- Images remain private while authorised application access is provided through temporary presigned URLs

---

## 📸 Screenshots

See the `screenshots/` folder for application, PWA and AWS infrastructure screenshots.

---

## 🧪 Evidence

Raw benchmark evidence is stored in `results/`:

```text
results/
├── jmeter/
│   ├── JMeter test plans
│   └── .jtl results
├── images/
│   └── benchmark payloads
├── cloudwatch/
│   └── Lambda metrics
└── terminal/
    └── timing and security validation outputs
```

---

## 🚀 Deployment

The frontend is deployed through **Amazon S3 + CloudFront**, with the backend running serverlessly through **API Gateway + Lambda + DynamoDB**.
