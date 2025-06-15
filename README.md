# Sync .env.example

Script Node.js para sincronizar automaticamente o arquivo `.env.example` com as variáveis `process.env` utilizadas no código.
Garante que todas as variáveis de ambiente usadas na aplicação (`process.env.VARIAVEL`) estejam presentes no `.env.example`.

## Como usar

```bash
node sync-env.js [caminho-do-projeto]
```

- Se nenhum caminho for informado, o diretório atual (`.`) será usado.
- O script procura por arquivos `.ts` e `.js` (recursivamente) e atualiza o `.env.example` no diretório raiz.

## O que faz

- Adiciona variáveis `process.env` que estão no código, mas não estão no `.env.example`.
- Remove variáveis do `.env.example` que não são mais usadas (a menos que sejam comentários ou estejam em uma lista de exceções).
- Mantém os comentários intactos.