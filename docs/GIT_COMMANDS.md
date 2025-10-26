# Git Commands for Renderizar para Lucrar

Este documento contém os comandos Git mais utilizados no projeto.

## Configuração Inicial

```bash
# Configurar repositório inicial
npm run git:setup

# Ou manualmente:
git init
git config user.name "Seu Nome"
git config user.email "seu@email.com"
git add .
git commit -m "Initial commit"
```

## Comandos Básicos

### Status e Informações
```bash
# Ver status do repositório
git status

# Ver histórico de commits
git log --oneline

# Ver diferenças
git diff
```

### Branches
```bash
# Criar e trocar para nova branch
git checkout -b feature/nova-funcionalidade

# Ou usar comando npm
npm run git:feature -- feature/nova-funcionalidade

# Listar branches
git branch -a

# Trocar de branch
git checkout main
git checkout feature/nome-da-feature
```

### Commits
```bash
# Adicionar arquivos específicos
git add src/screens/NovaScreen.tsx
git add src/components/

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: adicionar nova funcionalidade"

# Ou usar comando npm
npm run git:commit -- -m "feat: sua mensagem"
```

### Sincronização
```bash
# Adicionar repositório remoto
git remote add origin https://github.com/seu-usuario/renderizar-para-lucrar.git

# Fazer push
git push origin main
git push origin feature/nome-da-feature

# Ou usar comando npm
npm run git:push -- origin main

# Fazer pull
git pull origin main
```

## Convenções de Commit

Use as seguintes convenções para mensagens de commit:

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Mudanças na documentação
- `style:` - Mudanças de formatação/estilo
- `refactor:` - Refatoração de código
- `test:` - Adição ou modificação de testes
- `chore:` - Mudanças em ferramentas, configurações, etc.

### Exemplos:
```bash
git commit -m "feat: adicionar renderização AR 3D"
git commit -m "fix: corrigir erro ao salvar foto no SQLite"
git commit -m "docs: atualizar README com instruções de instalação"
git commit -m "refactor: melhorar estrutura do banco de dados"
```

## Fluxo de Trabalho

### Para novas funcionalidades:
```bash
# 1. Criar branch da funcionalidade
git checkout -b feature/nome-da-funcionalidade

# 2. Fazer alterações e commits
git add .
git commit -m "feat: implementar funcionalidade X"

# 3. Fazer push da branch
git push origin feature/nome-da-funcionalidade

# 4. Criar Pull Request no GitHub/GitLab

# 5. Após aprovação, fazer merge na main
git checkout main
git pull origin main
git merge feature/nome-da-funcionalidade
git push origin main

# 6. Deletar branch da funcionalidade
git branch -d feature/nome-da-funcionalidade
git push origin --delete feature/nome-da-funcionalidade
```

### Para correções rápidas:
```bash
# 1. Criar branch de hotfix
git checkout -b hotfix/correcao-urgente

# 2. Fazer correção e commit
git add .
git commit -m "fix: corrigir problema crítico"

# 3. Fazer merge direto na main
git checkout main
git merge hotfix/correcao-urgente
git push origin main

# 4. Deletar branch de hotfix
git branch -d hotfix/correcao-urgente
```

## Comandos Avançados

### Desfazer mudanças
```bash
# Desfazer mudanças não commitadas
git checkout -- arquivo.txt
git reset --hard HEAD

# Desfazer último commit (mantendo mudanças)
git reset --soft HEAD~1

# Desfazer último commit (perdendo mudanças)
git reset --hard HEAD~1
```

### Stash (guardar mudanças temporariamente)
```bash
# Guardar mudanças
git stash

# Ver stashes salvos
git stash list

# Aplicar último stash
git stash pop

# Aplicar stash específico
git stash apply stash@{0}
```

### Tags
```bash
# Criar tag de versão
git tag -a v1.0.0 -m "Versão 1.0.0"

# Fazer push das tags
git push origin --tags

# Listar tags
git tag -l
```

## Resolução de Conflitos

Quando há conflitos durante merge:

```bash
# 1. Git mostrará os arquivos com conflito
git status

# 2. Editar arquivos para resolver conflitos
# Procurar por <<<<<<< e >>>>>>> nos arquivos

# 3. Adicionar arquivos resolvidos
git add arquivo-resolvido.txt

# 4. Finalizar merge
git commit -m "resolve: conflitos de merge"
```

## Comandos NPM Personalizados

O projeto inclui scripts NPM para facilitar comandos Git:

```json
{
  "git:setup": "scripts/git-setup.bat",
  "git:feature": "git checkout -b",
  "git:commit": "git add . && git commit",
  "git:push": "git push origin"
}
```

### Uso:
```bash
# Configurar repositório
npm run git:setup

# Criar nova branch
npm run git:feature feature/nova-funcionalidade

# Commit rápido
npm run git:commit -- -m "feat: nova funcionalidade"

# Push para origin
npm run git:push main
```