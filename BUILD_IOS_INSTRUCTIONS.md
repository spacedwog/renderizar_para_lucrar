# Instruções para Gerar Executável iOS (.ipa)

## ✅ Configuração Concluída

O projeto foi configurado com sucesso para build iOS usando Expo Application Services (EAS Build). Os seguintes arquivos foram criados/atualizados:

- ✅ `eas.json` - Configuração do EAS Build
- ✅ `app.json` - Configuração do app com bundleIdentifier para iOS
- ✅ `assets/icon.png` - Ícone 1024x1024 criado
- ✅ `assets/splash.png` - Splash screen
- ✅ `assets/favicon.png` - Favicon para web
- ✅ Dependências instaladas
- ✅ Expo CLI instalado globalmente

## 📱 Como Gerar o Executável iOS

### Pré-requisitos

1. **Conta Apple Developer** (necessária para distribuição)
   - Conta individual: $99/ano
   - Conta organizacional: $299/ano
   - Inscreva-se em: [developer.apple.com](https://developer.apple.com)

2. **Conta Expo** (gratuita)
   - Crie em: [expo.dev](https://expo.dev)

### Passo a Passo

#### 1. Login no Expo
```cmd
npx expo login
```

#### 2. Configurar o Projeto
```cmd
npx eas build:configure
```

#### 3. Gerar Build para iOS
```cmd
# Build de produção (para App Store)
npx eas build --platform ios --profile production

# Build de desenvolvimento (para testes internos)
npx eas build --platform ios --profile development
```

#### 4. Alternativas de Distribuição

**Para App Store:**
```cmd
npx eas submit --platform ios
```

**Para TestFlight (beta testing):**
```cmd
npx eas build --platform ios --profile preview
```

**Para uso interno (sem App Store):**
```cmd
npx eas build --platform ios --profile development
```

## 🔧 Configurações Importantes

### Bundle Identifier
- Configurado como: `com.renderizarparalucrar.app`
- **Importante:** Deve ser único na App Store

### Perfis de Build (eas.json)
- **development**: Para testes locais e desenvolvimento
- **preview**: Para distribuição interna/TestFlight
- **production**: Para publicação na App Store

## 📝 Próximos Passos

1. **Criar conta Apple Developer** (se não tiver)
2. **Fazer login no Expo:** `npx expo login`
3. **Executar build:** `npx eas build --platform ios`
4. **Aguardar build na nuvem** (15-30 minutos)
5. **Baixar o arquivo .ipa** gerado

## ⚠️ Notas Importantes

- **Build na nuvem**: O EAS Build compila na nuvem da Expo
- **Tempo**: Builds podem levar 15-30 minutos
- **Créditos**: Plano gratuito inclui builds limitados
- **Certificados**: EAS gerencia automaticamente certificados iOS
- **Teste**: Use TestFlight para distribuir para testadores

## 🆘 Solução de Problemas

### Erro de Bundle Identifier
Se houver conflito, altere em `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.seudominio.renderizar"
}
```

### Erro de Conta Apple
Certifique-se de ter:
- Conta Apple Developer ativa
- Termos e condições aceitos
- Certificados em dia

### Build Falha
Verifique:
- Todas as dependências estão atualizadas
- Não há erros no código TypeScript
- Assets (ícones) estão no formato correto

## 📱 Testando o App

### No Simulador iOS (macOS apenas)
```cmd
npx expo run:ios
```

### No Dispositivo Real
1. Instale "Expo Go" da App Store
2. Execute: `npx expo start`
3. Escaneie o QR code

## 🔗 Links Úteis

- [Documentação EAS Build](https://docs.expo.dev/build/introduction/)
- [Guia iOS](https://docs.expo.dev/build-reference/ios-builds/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [TestFlight](https://developer.apple.com/testflight/)

---

**Comando principal para gerar o executável iOS:**
```cmd
npx eas build --platform ios
```

Aguarde o build na nuvem e baixe o arquivo .ipa gerado!