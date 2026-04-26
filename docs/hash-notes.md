# Criptografia e Decriptografia das Notas

## Visao geral

No `organizandotudo.api`, os campos de texto das notas (`title` e `content`) sao protegidos com criptografia reversivel.

Isso significa:

- ao salvar no banco, o texto e criptografado;
- ao retornar na API, o texto e decriptografado;
- diferente de senha, aqui o sistema precisa recuperar o valor original.

## Onde isso acontece no projeto

A logica esta dividida entre dois pontos:

- `src/modules/common/services/encryption.service.ts`
  - `encryptData(data: string): string`
  - `decryptData(encryptedData: string): string`
  - aliases usados no projeto: `encrypt()` e `decrypt()`

- `src/modules/notes/notes.service.ts`
  - chama `encrypt()` antes de persistir `title` e `content`;
  - chama `decrypt()` antes de responder ao cliente.

## Algoritmo e parametros usados

No `EncryptionService`, os principais parametros sao:

- algoritmo: `aes-256-gcm`
- tamanho da chave derivada: `32` bytes
- tamanho do IV: `16` bytes
- tamanho esperado da tag: `16` bytes

A chave nao vem pronta do `.env`. Ela e derivada em tempo de execucao:

1. le `ENCRYPTION_KEY` da configuracao;
2. executa `crypto.scryptSync(secret, 'salt', 32)`;
3. usa o buffer resultante como chave simetrica.

Se `ENCRYPTION_KEY` nao existir, o servico gera erro: `ENCRYPTION_KEY not configured`.

## Logica de criptografia das notas

Quando uma nota e criada ou atualizada, os campos textuais passam por `encrypt()`.

Fluxo interno do `encryptData`:

1. Deriva a chave via `getKey()`.
2. Gera um IV aleatorio com `crypto.randomBytes(16)`.
3. Cria o cipher com `crypto.createCipher('aes-256-gcm', key)`.
4. Define AAD fixa: `additional-data`.
5. Criptografa o texto (`utf8` -> `hex`).
6. Coleta auth tag com `getAuthTag()`.
7. Retorna string no formato: `ivHex:tagHex:encryptedHex`.

Formato persistido no MongoDB para `title` e `content`:

`<iv_em_hex>:<tag_em_hex>:<conteudo_criptografado_em_hex>`

## Logica de decriptografia das notas

Sempre que a API precisa devolver dados de nota ao cliente, ela executa `decrypt()`.

Fluxo interno do `decryptData`:

1. Divide a string salva por `:`.
2. Valida que existem 3 partes.
3. Reconstrui `iv` e `tag` a partir de hex.
4. Deriva novamente a chave com `getKey()`.
5. Cria decipher com `crypto.createDecipher('aes-256-gcm', key)`.
6. Define a mesma AAD fixa: `additional-data`.
7. Aplica `setAuthTag(tag)`.
8. Decriptografa o payload (`hex` -> `utf8`).
9. Retorna o texto original.

Se qualquer etapa falhar, o servico lanca: `Data decryption failed`.

## Ciclo completo da nota no sistema

### Criacao

Em `NotesService.create`:

1. Recebe `title`, `content`, `isPublic`.
2. Criptografa `title` e `content`.
3. Persiste no banco somente valores criptografados.
4. Retorna o documento salvo.

### Listagem

Em `NotesService.findAll`:

1. Busca documentos no banco.
2. Para cada nota, decriptografa `title` e `content`.
3. Retorna resposta paginada com texto legivel ao cliente.

### Busca por ID

Em `NotesService.findOne`:

1. Busca a nota do usuario.
2. Decriptografa campos textuais.
3. Retorna dados decriptografados.

### Atualizacao

Em `NotesService.update`:

1. Valida se a nota existe.
2. Se `title` vier no payload, criptografa novamente.
3. Se `content` vier no payload, criptografa novamente.
4. Atualiza no banco.
5. Decriptografa antes de montar resposta.

### Alternancia publico/privado

Em `NotesService.togglePublic`:

1. Atualiza apenas `isPublic`.
2. Mantem `title` e `content` como estao no banco.
3. Decriptografa os campos textuais para a resposta.

## Estrutura dos dados no banco

Schema de nota (`src/modules/notes/schemas/note.schema.ts`):

- `title: string` -> valor criptografado em formato textual
- `content: string` -> valor criptografado em formato textual
- `isPublic: boolean`
- `userId`
- `deletedAt`, `createdAt`, `updatedAt`

Mesmo sendo `string`, `title` e `content` nao ficam em texto puro no armazenamento.

## Relacao entre chave, leitura e consistencia

Para decriptografar corretamente, o sistema precisa manter consistencia em:

- mesma `ENCRYPTION_KEY`;
- mesmo processo de derivacao de chave (`scryptSync` com o mesmo salt fixo);
- mesma AAD (`additional-data`);
- preservacao do formato `iv:tag:encrypted`.

Qualquer alteracao nesses elementos pode impedir leitura de notas ja salvas.

## Comportamento em caso de erro

`EncryptionService` encapsula excecoes e retorna erros genericos:

- `Data encryption failed`
- `Data decryption failed`

Na pratica, isso cobre cenarios como:

- payload fora do formato esperado;
- chave inconsistente;
- dados corrompidos;
- falha no processo criptografico.

## Diferenca para o fluxo de senha

- Notas: criptografia reversivel (encrypt/decrypt), porque o sistema precisa mostrar o texto original.
- Senhas: hash irreversivel (bcrypt), porque o sistema nao deve recuperar senha original.

## Resumo tecnico final

- Campos de nota sao criptografados no write path (`create` e `update`).
- Campos de nota sao decriptografados no read path (`findAll`, `findOne`, `togglePublic`, resposta de `update`).
- Persistencia usa formato textual composto por `iv`, `tag` e payload criptografado.
- O processo depende diretamente de `ENCRYPTION_KEY` e da mesma configuracao criptografica durante todo o ciclo de vida dos dados.
