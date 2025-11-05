# Prompt para Backend: Erro 401 no Endpoint set-unauthenticated

## Problema Identificado

O endpoint `POST /api/v1/auth/password/set-unauthenticated` está retornando **401 Unauthorized** com a mensagem "Missing or invalid authentication token" quando o frontend tenta setar a senha para um Google user sem senha.

## Contexto do Fluxo

1. Usuário faz login com Google OAuth2
2. Backend retorna tokens (access + refresh em HttpOnly cookie)
3. Frontend redireciona para `/protected/dashboard`
4. Usuário vê `PasswordNotice` (box vermelho) pedindo para setar senha
5. Usuário clica em "Set a new password"
6. Frontend redireciona para `/set-password?email=...`
7. Usuário digita nova senha e submete
8. **Frontend faz POST para `/api/v1/auth/password/set-unauthenticated`**
9. **Backend retorna 401 Unauthorized** ❌

## Request Enviado pelo Frontend

```http
POST /api/v1/auth/password/set-unauthenticated
Content-Type: application/json
Accept: application/json
Authorization: Bearer <accessToken>  (se houver sessão NextAuth)
X-CSRF-Token: <csrfToken>  (se disponível)
Cookie: refresh_token=<...>; csrf_token=<...>

Body:
{
  "email": "user@gmail.com",
  "newPassword": "NewPassword123"
}
```

## Comportamento Esperado

O endpoint `set-unauthenticated` deveria:

1. **NÃO exigir autenticação JWT obrigatória** (é "unauthenticated")
2. **Aceitar apenas email e newPassword** no body
3. **Validar que:**
   - O email existe no banco
   - O usuário tem `auth_provider = "GOOGLE"`
   - O usuário tem `password_set = false`
4. **Se todas as condições forem verdadeiras:**
   - Hash a senha
   - Salva no banco
   - Atualiza `password_set = true`
   - Retorna 200 OK

## Possíveis Problemas no Backend

### 1. Endpoint Protegido Incorretamente
O endpoint pode estar marcado como protegido/autenticado quando não deveria ser.

**Verificar:**
- Spring Security configuration
- Se há `@PreAuthorize` ou `@Secured` no controller
- Se há filtros de autenticação aplicados

### 2. Exigindo Token de Autenticação
O endpoint pode estar exigindo JWT token mesmo sendo "unauthenticated".

**Verificar:**
- Se o endpoint está em um grupo de rotas que requer autenticação
- Se há middleware/filter verificando Authorization header

### 3. CSRF Token Incorreto
O endpoint pode estar validando CSRF token de forma incorreta.

**Verificar:**
- Se o CSRF token está sendo validado corretamente
- Se o header `X-CSRF-Token` está sendo lido do request
- Se o cookie `csrf_token` está sendo validado

### 4. Validação de Email/Usuário Falhando
O endpoint pode estar retornando 401 se não encontrar o usuário ou se as condições não forem atendidas.

**Verificar:**
- Se o email está sendo encontrado no banco
- Se a validação `auth_provider = "GOOGLE"` está funcionando
- Se a validação `password_set = false` está funcionando
- Se deveria retornar 400/404 em vez de 401 para esses casos

## Logs Esperados no Backend

Quando o frontend faz a requisição, o backend deveria logar:

```
POST /api/v1/auth/password/set-unauthenticated
Email: user@gmail.com
User found: true
Auth provider: GOOGLE
Password set: false
Validation: OK
Password hashed and saved
password_set updated to: true
Response: 200 OK
```

## Teste Recomendado

1. **Teste Manual:**
   ```bash
   curl -X POST https://dianagloballoginregister-52599bd07634.herokuapp.com/api/v1/auth/password/set-unauthenticated \
     -H "Content-Type: application/json" \
     -H "X-CSRF-Token: <csrf_token>" \
     -H "Cookie: csrf_token=<csrf_token>" \
     -d '{
       "email": "user@gmail.com",
       "newPassword": "TestPassword123"
     }'
   ```

2. **Verificar no MongoDB:**
   - Usuário com `auth_provider = "GOOGLE"`
   - Usuário com `password_set = false`
   - Tentar setar senha
   - Verificar se `password_set` é atualizado para `true`

## Solução Esperada

O endpoint deve:

1. **Aceitar requisições sem JWT token obrigatório** (mas pode validar CSRF)
2. **Validar email existe e é Google user sem senha**
3. **Se válido:**
   - Hash e salvar senha
   - Atualizar `password_set = true`
   - Retornar 200 OK
4. **Se inválido:**
   - Retornar 400 Bad Request (email não encontrado, não é Google, já tem senha)
   - NÃO retornar 401 (isso indica problema de autenticação, não de validação)

## Status Atual Frontend

O frontend está enviando:
- ✅ Email e newPassword no body
- ✅ CSRF token no header (se disponível)
- ✅ Authorization header (se houver sessão NextAuth)
- ✅ Credentials: include (para cookies)

**O problema está no backend retornando 401 quando deveria aceitar a requisição.**

---

**Data:** 2025-11-05  
**Prioridade:** Alta - Bloqueia funcionalidade crítica  
**Frontend:** Pronto e aguardando correção do backend

