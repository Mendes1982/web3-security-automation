# CI/CD Setup Guide

Este projeto suporta **três opções de CI/CD** para garantir flexibilidade:

## 🎯 Opções Disponíveis

| Plataforma | Minutos Gratuitos | Status | Arquivo |
|------------|------------------|--------|---------|
| **GitHub Actions** | 2000/mês | ⚠️ Limitado por billing | `.github/workflows/ci.yml` |
| **CircleCI** | 2500/mês | ✅ Recomendado | `.circleci/config.yml` |
| **GitLab CI** | Ilimitado (público) | ✅ Alternativa | `.gitlab-ci.yml` |

---

## 🚀 Configuração do CircleCI (Recomendado)

### Passo 1: Criar Conta

1. Acesse: https://circleci.com/signup/
2. Cadastre-se com sua conta do GitHub
3. Autorize acesso ao repositório `web3-security-automation`

### Passo 2: Configurar Projeto

1. No dashboard do CircleCI, clique em "Add Projects"
2. Encontre `Mendes1982/web3-security-automation`
3. Clique em "Set Up Project"
4. Selecione: "Use existing config" (já temos o `.circleci/config.yml`)

### Passo 3: Adicionar Variáveis de Ambiente (Opcional)

Se precisar de secrets:

1. No CircleCI, vá em: Project Settings → Environment Variables
2. Adicione:
   - `SLACK_WEBHOOK_URL` (para notificações)
   - `TEST_WALLET_PRIVATE_KEY` (para testes - use wallet de teste!)

### Passo 4: Executar Pipeline

O pipeline será executado automaticamente em cada push para:
- `main`
- `develop`
- Pull requests

---

## 🦊 Configuração do GitLab CI

### Opção 1: Espelhar Repositório do GitHub

1. No GitLab, crie um novo projeto
2. Vá em: Settings → Repository → Mirror repository
3. Adicione URL do GitHub: `https://github.com/Mendes1982/web3-security-automation`
4. Configure mirror automático

### Opção 2: Migrar para GitLab

```bash
# Adicionar remote do GitLab
git remote add gitlab https://gitlab.com/seu-usuario/web3-security-automation.git

# Push para GitLab
git push gitlab main
```

O arquivo `.gitlab-ci.yml` já está configurado e será executado automaticamente!

---

## 📊 Workflows Configurados

### CircleCI Workflows

```
┌─────────────────────────────────────────────────────────────────┐
│                        CI/CD Pipeline                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. lint-and-typecheck                                          │
│           │                                                     │
│           ▼                                                     │
│  2. smoke-tests + docker-build (paralelos)                      │
│           │                                                     │
│           ▼                                                     │
│  3. test-chromium + test-firefox + test-webkit (paralelos)     │
│           │                                                     │
│           ▼                                                     │
│  4. test-security (apenas main/develop)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### GitLab CI Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitLab Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Stage 1: lint                                                  │
│    └── lint-and-typecheck                                       │
│                                                                 │
│  Stage 2: test                                                  │
│    ├── smoke-tests                                              │
│    ├── test-chromium (paralelo x3)                              │
│    ├── test-firefox (opcional)                                  │
│    └── test-webkit (opcional)                                   │
│                                                                 │
│  Stage 3: security                                              │
│    └── test-security                                            │
│                                                                 │
│  Stage 4: build                                                 │
│    └── docker-build                                             │
│                                                                 │
│  Stage 5: deploy                                                │
│    └── pages (GitLab Pages)                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Comparativo Rápido

| Feature | GitHub Actions | CircleCI | GitLab CI |
|---------|---------------|----------|-----------|
| **Minutos Gratuitos** | 2000/mês | 2500/mês | Ilimitado |
| **Parallelismo** | 20 jobs | Ilimitado | Ilimitado |
| **Docker Layer Caching** | ✅ | ✅ | ✅ |
| **Artifacts** | ✅ | ✅ | ✅ |
| **Test Reports** | ✅ | ✅ | ✅ |
| **Matrix Builds** | ✅ | ✅ | ✅ |
| **Orbs/Plugins** | Actions | Orbs | Templates |
| **Notificações Slack** | ✅ | ✅ | ✅ |

---

## 🛠️ Troubleshooting

### CircleCI: "Resource class not found"

Adicione ao `config.yml`:
```yaml
resource_class: medium  # ou small, large, xlarge
```

### GitLab CI: "Playwright browsers not found"

O script já instala os browsers, mas se falhar:
```yaml
before_script:
  - apt-get update && apt-get install -y libnss3 libnspr4 libatk1.0-0
  - npx playwright install chromium
```

### Erro de Permissão no Docker

Para CircleCI:
```yaml
- setup_remote_docker:
    version: 20.10.14
    docker_layer_caching: true
```

---

## 📈 Monitoramento

### CircleCI Insights

Acesse: https://app.circleci.com/insights/github/Mendes1982/web3-security-automation

Métricas disponíveis:
- Tempo médio de build
- Taxa de sucesso
- Uso de créditos
- Flaky tests

### GitLab CI Analytics

Acesse: Project → CI/CD → Pipelines → Analytics

---

## 🎯 Recomendação

**Para seu caso atual:**

1. ✅ **CircleCI** (Recomendado)
   - 2500 minutos/mês
   - Fácil migração do GitHub
   - Ótima documentação

2. 🦊 **GitLab CI** (Alternativa)
   - Ilimitado para projetos públicos
   - Built-in Container Registry
   - GitLab Pages integrado

**Configure o CircleCI agora** e tenha CI/CD funcionando em 5 minutos! 🚀

---

## 📞 Suporte

- **CircleCI Docs:** https://circleci.com/docs/
- **GitLab CI Docs:** https://docs.gitlab.com/ee/ci/
- **Playwright CI Guide:** https://playwright.dev/docs/ci
