---
name: api-docs
description: "Auto-generate OpenAPI/Swagger specs from code with SDK examples"
profile: standard
triggers:
  en: ["API docs", "API documentation", "OpenAPI", "Swagger", "SDK examples"]
  th: ["เอกสาร API", "API docs", "สร้างเอกสาร API"]
---

## Quick Reference
Extracts API endpoints from code and generates OpenAPI specs with examples.
- **Extract**: Scan route handlers, decorators, annotations for endpoints
- **Generate**: OpenAPI 3.0 spec (YAML/JSON)
- **Examples**: SDK usage snippets (curl, JS, Python)
- **Output**: `_aegis-output/api-docs/`
- **Agent**: Echo (sonnet) — documentation; Beast (haiku) — extraction

## Full Instructions

### Invocation

```
/api-docs [extract|generate|examples|all] [target]
```
- `extract` — Scan code and list all endpoints
- `generate` — Generate OpenAPI 3.0 spec
- `examples` — Generate SDK usage examples
- `all` — Full pipeline (default)

### Phase 1: Endpoint Extraction

Scan for route definitions by framework:

#### Express.js
```javascript
// Patterns to detect:
app.get('/path', handler)
app.post('/path', middleware, handler)
router.get('/path', handler)
```

#### FastAPI
```python
# Patterns to detect:
@app.get("/path")
@router.post("/path", response_model=Model)
```

#### NestJS
```typescript
// Patterns to detect:
@Get('/path')
@Post('/path')
@Controller('prefix')
```

#### Next.js API Routes
```
// File-based routing:
app/api/users/route.ts → GET/POST /api/users
app/api/users/[id]/route.ts → GET/PUT/DELETE /api/users/:id
```

For each endpoint, extract:
- HTTP method
- Path (with parameters)
- Request body schema (from validation/types)
- Response schema (from return types/models)
- Authentication requirements
- Middleware chain
- JSDoc/docstring description

### Phase 2: OpenAPI 3.0 Spec Generation

```yaml
openapi: 3.0.3
info:
  title: <project name> API
  version: <from package.json/pyproject.toml>
  description: <from README or generated>

servers:
  - url: http://localhost:<port>
    description: Development
  - url: https://api.<domain>
    description: Production

paths:
  /api/<resource>:
    get:
      summary: <description>
      operationId: <functionName>
      tags:
        - <resource>
      parameters:
        - name: <param>
          in: query|path|header
          required: true|false
          schema:
            type: <type>
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/<Model>'
              example:
                <example object>
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '404':
          description: Not Found
        '500':
          description: Internal Server Error

    post:
      summary: <description>
      operationId: <functionName>
      tags:
        - <resource>
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/<CreateModel>'
            example:
              <example object>
      responses:
        '201':
          description: Created

components:
  schemas:
    <Model>:
      type: object
      properties:
        <field>:
          type: <type>
          description: <description>
      required:
        - <required fields>

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []

tags:
  - name: <resource>
    description: <resource description>
```

### Phase 3: SDK Examples

For each endpoint, generate examples in multiple languages:

#### curl
```bash
# GET /api/users
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"

# POST /api/users
curl -X POST "http://localhost:3000/api/users" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@example.com"}'
```

#### JavaScript (fetch)
```javascript
// GET /api/users
const response = await fetch('http://localhost:3000/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
const users = await response.json();
```

#### Python (httpx)
```python
import httpx

# GET /api/users
response = httpx.get(
    "http://localhost:3000/api/users",
    params={"page": 1, "limit": 10},
    headers={"Authorization": f"Bearer {token}"},
)
users = response.json()
```

### Output

```
_aegis-output/api-docs/
  openapi.yaml
  openapi.json
  examples/
    curl.md
    javascript.md
    python.md
  endpoint-inventory.md
```

### Integration

- Serve spec with Swagger UI: recommend `swagger-ui-express` or `fastapi` built-in
- Generate client SDK: recommend `openapi-generator` or `orval`
- Validate spec: use `@stoplight/spectral` for linting
