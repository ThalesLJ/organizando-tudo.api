# Hash de Senhas de Usuários

## Visão geral

No projeto `organizandotudo.api`, as senhas de usuários nao sao criptografadas de forma reversivel. Elas sao protegidas com **hash bcrypt**, que e um processo propositalmente **irreversivel**.

Isso significa:

- a API **nunca** guarda senha em texto puro;
- a API **nunca** precisa decriptografar senha;
- para autenticar, a API compara a senha digitada com o hash salvo.

## Onde isso acontece no projeto

O fluxo de senha esta centralizado no servico `HashService`:

- `hash(value)` -> gera hash com `bcryptjs`
- `verify(hash, plainValue)` -> valida senha digitada contra hash salvo

Uso principal no modulo de autenticacao:

- `register` -> gera hash antes de salvar usuario
- `login` -> compara senha informada com hash do banco
- `verifyCode` (recuperacao de senha) -> gera novo hash e atualiza senha

## Como o hash e gerado

Na funcao `hash`, o projeto usa:

- biblioteca `bcryptjs`
- custo computacional `saltRounds = 12`

Conceitualmente:

1. Recebe a senha em texto puro (somente em memoria durante a requisicao).
2. O bcrypt gera um salt interno e aplica varias rodadas de derivacao.
3. Retorna uma string de hash (formato bcrypt) para persistencia no banco.

Exemplo de formato de hash bcrypt:

`$2a$12$w6Q3...`

Interpretacao basica:

- `$2a$` -> variante do bcrypt
- `12` -> fator de custo (salt rounds)
- restante -> salt + hash codificados

## Como a validacao funciona (sem decriptar)

Na autenticacao (`login` e `validateUser`), o sistema:

1. Busca o usuario no banco.
2. Recupera o hash armazenado em `user.password`.
3. Executa `bcrypt.compare(senhaDigitada, hashSalvo)`.
4. Se retornar `true`, a senha esta correta.
5. Se retornar `false`, retorna credencial invalida.

Ponto importante: o `compare` **nao decripta** o hash. Ele recalcula internamente e compara de forma segura.

## Fluxos completos no sistema

### Cadastro de usuario

1. Cliente envia `username`, `email`, `password`.
2. API verifica se username/email ja existem.
3. API gera hash com bcrypt (`hash`).
4. API salva usuario com `password` ja em hash.
5. API retorna token JWT.

### Login de usuario

1. Cliente envia `email` ou `username`, e `password`.
2. API busca usuario por email ou username.
3. API compara senha com `verify`.
4. Se valido, gera JWT.
5. Se invalido, retorna `Unauthorized`.

### Redefinicao de senha

1. Usuario recebe codigo de verificacao por email.
2. Informa codigo + nova senha.
3. API valida codigo e usuario.
4. API gera novo hash da nova senha.
5. API atualiza `user.password` com o novo hash.

## "Criptografar" vs "Hash" no contexto de senha

Para senha de usuario, o correto e usar **hash**, nao criptografia reversivel.

- **Hash (bcrypt)**:
  - irreversivel
  - ideal para senha
  - validacao por comparacao (`compare`)

- **Criptografia reversivel**:
  - possui encrypt/decrypt
  - usada quando e necessario recuperar dado original
  - nao e recomendada para armazenamento de senha

## Sobre "decriptografar senha"

Tecnicamente, em boas praticas de seguranca:

- senha com bcrypt **nao pode ser decriptografada**;
- se houver necessidade de recuperar "texto original", entao nao e hash de senha, e outro tipo de dado com criptografia reversivel.

No projeto atual, isso ja esta correto:

- senha usa hash bcrypt (irreversivel);
- dados sensiveis de notas usam metodos de criptografia reversivel (`encrypt` e `decrypt`).

## Vantagens de seguranca desta abordagem

- reduz impacto de vazamento de banco (nao expoe senha original diretamente);
- custo de quebra e elevado por causa de `saltRounds = 12`;
- evita dependencia de chave para "decriptar senha";
- separa corretamente os conceitos: senha com hash e dados de negocio com criptografia.

## Limites e pontos de atencao

- hash nao impede senha fraca; politica de senha forte continua necessaria;
- fator de custo deve ser reavaliado periodicamente conforme hardware evolui;
- limite de tentativas e monitoramento de login ajudam contra brute force online;
- logs nao devem registrar senha em texto puro.

## Resumo tecnico final

- Neste sistema, senha de usuario:
  - entra em texto puro apenas durante a requisicao;
  - e transformada em hash bcrypt antes de persistir;
  - nunca e decriptada;
  - e validada via `bcrypt.compare`.

- Portanto:
  - existe processo de "proteger senha" (hash);
  - nao existe processo de "decriptografar senha";
  - existe criptografia reversivel apenas para outros dados da aplicacao.
