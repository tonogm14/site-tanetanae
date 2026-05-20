# Tane Tanae API

Lightweight Express proxy/wrapper for the Tane Tanae WordPress REST API.

## Setup

```bash
cp .env.example .env
npm install
npm run dev   # development with nodemon
npm start     # production
```

## Environment Variables

| Variable    | Default                                    | Description                         |
|-------------|--------------------------------------------|-------------------------------------|
| WP_API_URL  | https://tanetanae.com/wp-json/wp/v2        | WordPress REST API base URL         |
| PORT        | 3001                                       | Server port                         |
| CACHE_TTL   | 300                                        | Default cache TTL in seconds        |

## Endpoints

| Method | Path                      | Description                                           |
|--------|---------------------------|-------------------------------------------------------|
| GET    | /health                   | Health check                                          |
| GET    | /posts                    | List posts (`page`, `per_page`, `category` query params) |
| GET    | /posts/:id                | Single post by WordPress ID                           |
| GET    | /posts/slug/:slug         | Single post by slug                                   |
| GET    | /categories               | All categories                                        |
| GET    | /breaking                 | Latest 5 posts from "ultima-hora" category            |
| GET    | /hero                     | Latest 4 posts with embed (for hero slider)           |
| GET    | /most-read                | Most viewed posts (fallback to recent by date)        |
| GET    | /search?q=query           | Full-text search (`q`, `page`, `per_page`)            |

## Data Shape

All post responses are transformed to match the `TT_DATA` structure from the frontend:

```json
{
  "id": "123",
  "slug": "post-slug",
  "cat": "Política",
  "catSlug": "politica",
  "kicker": "Política",
  "title": "Post title",
  "excerpt": "Short description...",
  "deck": "Short description...",
  "img": "politica",
  "imgUrl": "https://example.com/photo.jpg",
  "author": "Toni Medina",
  "authorRole": "Editor de Política",
  "date": "14 may 2026",
  "time": "09:42 AM",
  "readTime": "5 min",
  "link": "https://tanetanae.com/post-slug"
}
```

The `img` field contains the category slug, which maps to the CSS class `tt-img--{slug}` for color-coded placeholder gradients when no image URL is available.

## Caching

Responses are cached in memory using `node-cache`. TTLs:
- `/breaking`: 60 seconds
- `/hero` and `/posts`: 120 seconds
- `/posts/:id` and `/posts/slug/:slug`: 300 seconds
- `/categories`: 600 seconds
