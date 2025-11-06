# 🔒 CSRF Token Requirements for Backend

## 🚨 PROBLEMA CRÍTICO NO BACKEND

O frontend está recebendo **403 Forbidden** ao tentar fazer POST para `/api/v1/auth/password/set-unauthenticated` porque o backend está exigindo CSRF token mesmo na primeira requisição POST.

**O frontend está implementado corretamente.** O problema está no backend que não está gerando o CSRF token na primeira requisição POST.

## ✅ O que o Frontend Espera do Backend

### **1. Primeira Requisição POST (sem CSRF token)**

Quando o frontend faz a **primeira requisição POST** sem CSRF token (por exemplo, após Google OAuth), o backend deve:

1. **Detectar que não há cookie CSRF** no request
2. **Gerar um novo token CSRF**
3. **Retornar o token no cookie** `Set-Cookie: csrf_token=<token>`
4. **Processar a requisição normalmente** (não retornar 403)

**Exemplo de fluxo esperado:**

```
Frontend: POST /api/v1/auth/password/set-unauthenticated
Headers: (sem X-CSRF-Token)
Cookies: (sem csrf_token)

Backend:
  - Detecta ausência de CSRF token
  - Gera novo token CSRF
  - Retorna: Set-Cookie: csrf_token=abc123...
  - Processa requisição normalmente
  - Retorna: 200 OK
```

### **2. Requisições Subsequentes (com CSRF token)**

Após a primeira requisição, o frontend terá o CSRF token no cookie. O backend deve:

1. **Validar que o header `X-CSRF-Token`** corresponde ao cookie `csrf_token`
2. **Se válido** → processar requisição
3. **Se inválido** → retornar 403 Forbidden

**Exemplo de fluxo esperado:**

```
Frontend: POST /api/v1/auth/password/set-unauthenticated
Headers: X-CSRF-Token: abc123...
Cookies: csrf_token=abc123...

Backend:
  - Valida: header === cookie
  - Se válido → processa requisição
  - Retorna: 200 OK
```

### **3. Endpoint `/api/v1/auth/password/set-unauthenticated`**

Este endpoint é especial porque:

- **Não requer autenticação** (usuário pode não ter senha ainda)
- **Mas requer CSRF token** para proteção contra ataques
- **Deve permitir primeira requisição POST sem CSRF token** e gerar o token na resposta

**Comportamento esperado:**

```java
@PostMapping("/api/v1/auth/password/set-unauthenticated")
public ResponseEntity<?> setPasswordUnauthenticated(
    @RequestBody SetPasswordRequest request,
    HttpServletRequest httpRequest,
    HttpServletResponse httpResponse
) {
    // 1. Verificar se há CSRF token no cookie
    String csrfCookie = getCookieValue(httpRequest, "csrf_token");
    String csrfHeader = httpRequest.getHeader("X-CSRF-Token");
    
    // 2. Se não há cookie CSRF, gerar novo token
    if (csrfCookie == null || csrfCookie.isEmpty()) {
        String newCsrfToken = generateCsrfToken();
        setCookie(httpResponse, "csrf_token", newCsrfToken);
        // Processar requisição normalmente (sem validar CSRF na primeira vez)
        return processSetPassword(request);
    }
    
    // 3. Se há cookie CSRF, validar que header corresponde ao cookie
    if (csrfHeader == null || !csrfHeader.equals(csrfCookie)) {
        return ResponseEntity.status(403)
            .body(Map.of("message", "Invalid CSRF token"));
    }
    
    // 4. Processar requisição
    return processSetPassword(request);
}
```

## 🐛 Problema Atual no Backend

O backend está retornando **403 Forbidden** mesmo quando:

1. Não há CSRF token no cookie (primeira requisição)
2. O frontend tenta fazer POST sem CSRF token

**Erros observados:**

```
GET /api/v1/auth/password/set-unauthenticated → 401 (não deveria exigir auth)
POST /api/v1/auth/password/set-unauthenticated → 403 (deveria gerar token na primeira vez)
GET /api/v1/auth/register → 500 (erro interno)
```

**O frontend está funcionando corretamente:**
- ✅ Lê cookie `csrf_token` quando disponível
- ✅ Envia header `X-CSRF-Token` quando tem token
- ✅ Faz POST sem CSRF token na primeira vez (esperando que backend gere)
- ✅ Captura CSRF token da resposta quando disponível

**O problema é 100% no backend que não está:**
- ❌ Gerando CSRF token na primeira requisição POST
- ❌ Retornando token no cookie `Set-Cookie: csrf_token=<token>`
- ❌ Permitindo primeira requisição POST sem CSRF token

## ✅ Solução Esperada no Backend

### **Opção 1: Permitir primeira requisição POST sem CSRF**

```java
// Se não há cookie CSRF, gerar e processar
if (csrfCookie == null) {
    generateAndSetCsrfToken(httpResponse);
    // Processar requisição sem validar CSRF
    return processRequest(request);
}
```

### **Opção 2: Gerar CSRF token em qualquer requisição GET/OPTIONS**

```java
@GetMapping("/api/v1/auth/password/set-unauthenticated")
public ResponseEntity<?> getCsrfToken(HttpServletResponse httpResponse) {
    String csrfToken = generateCsrfToken();
    setCookie(httpResponse, "csrf_token", csrfToken);
    return ResponseEntity.ok().build();
}
```

### **Opção 3: Gerar CSRF token no primeiro acesso (qualquer método)**

```java
// Interceptor ou Filter que gera CSRF token se não existir
if (csrfCookie == null) {
    generateAndSetCsrfToken(httpResponse);
}
```

## 📝 Checklist para Backend

- [ ] Backend gera CSRF token na primeira requisição POST sem token
- [ ] Backend retorna CSRF token no cookie `Set-Cookie: csrf_token=<token>`
- [ ] Backend valida CSRF token apenas se já existir no cookie
- [ ] Endpoint `set-unauthenticated` não exige autenticação
- [ ] Endpoint `set-unauthenticated` permite primeira requisição POST sem CSRF
- [ ] Backend retorna 403 apenas quando CSRF token é inválido (não quando ausente na primeira vez)

## 🔍 Debug

Para verificar se o problema está no backend:

1. **Verificar se o cookie CSRF está sendo setado:**
   ```bash
   curl -v -X POST https://dianagloballoginregister-52599bd07634.herokuapp.com/api/v1/auth/password/set-unauthenticated \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","newPassword":"Test1234"}' \
     -c cookies.txt
   ```

2. **Verificar se o cookie foi setado:**
   ```bash
   cat cookies.txt | grep csrf_token
   ```

3. **Fazer requisição com CSRF token:**
   ```bash
   CSRF_TOKEN=$(cat cookies.txt | grep csrf_token | awk '{print $7}')
   curl -v -X POST https://dianagloballoginregister-52599bd07634.herokuapp.com/api/v1/auth/password/set-unauthenticated \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: $CSRF_TOKEN" \
     -d '{"email":"test@example.com","newPassword":"Test1234"}' \
     -b cookies.txt
   ```

## 🎯 Resumo

**O frontend está implementado corretamente** e segue o padrão double-submit CSRF:
- Lê cookie `csrf_token`
- Envia valor no header `X-CSRF-Token`
- Captura token da resposta quando disponível

**O problema está no backend** que:
- Não está gerando CSRF token na primeira requisição POST
- Está retornando 403 mesmo quando não há token (primeira requisição)
- Não está permitindo primeira requisição POST sem CSRF token

**Solução:** Backend deve permitir primeira requisição POST sem CSRF token, gerar o token na resposta, e validar apenas em requisições subsequentes.

