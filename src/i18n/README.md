# Sistema de Traduções / Translation System

## 📖 Como Funciona / How It Works

Este projeto usa **react-i18next** para internacionalização (i18n). Todas as strings visíveis devem ser traduzidas usando o sistema de traduções.

This project uses **react-i18next** for internationalization (i18n). All visible strings should be translated using the translation system.

## 🗂️ Estrutura / Structure

```
src/i18n/
├── index.ts              # Configuração do i18n / i18n configuration
├── locales/
│   ├── en.json          # Traduções em Inglês / English translations
│   ├── pt.json          # Traduções em Português / Portuguese translations
│   └── [novo idioma].json  # Adicione aqui / Add new languages here
└── README.md            # Este ficheiro / This file
```

## 🚀 Como Usar / How to Use

### 1. Em Componentes React / In React Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('landing.hero.subtitle')}</p>
    </div>
  );
}
```

### 2. Estrutura das Chaves / Key Structure

As chaves de tradução são organizadas hierarquicamente:

Translation keys are organized hierarchically:

```json
{
  "common": {
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "landing": {
    "hero": {
      "title": "Master Your Typing Skills"
    }
  }
}
```

Uso / Usage:
- `t('common.signIn')` → "Sign In"
- `t('landing.hero.title')` → "Master Your Typing Skills"

## ➕ Como Adicionar um Novo Idioma / How to Add a New Language

### Passo 1: Criar o Ficheiro de Traduções / Step 1: Create Translation File

Crie um novo ficheiro JSON em `src/i18n/locales/` com o código do idioma:

Create a new JSON file in `src/i18n/locales/` with the language code:

```bash
# Exemplo: Espanhol / Example: Spanish
src/i18n/locales/es.json
```

### Passo 2: Copiar a Estrutura / Step 2: Copy Structure

Copie a estrutura completa de `en.json` ou `pt.json` e traduza todos os valores:

Copy the complete structure from `en.json` or `pt.json` and translate all values:

```json
{
  "common": {
    "signIn": "Iniciar Sesión",
    "signOut": "Cerrar Sesión"
  },
  "landing": {
    "hero": {
      "title": "Domina Tus Habilidades de Mecanografía"
    }
  }
}
```

### Passo 3: Importar no index.ts / Step 3: Import in index.ts

Adicione a importação em `src/i18n/index.ts`:

Add the import in `src/i18n/index.ts`:

```typescript
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';
import esTranslations from './locales/es.json'; // Novo idioma / New language

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      en: { translation: enTranslations },
      pt: { translation: ptTranslations },
      es: { translation: esTranslations }, // Adicionar aqui / Add here
    },
    // ...
  });
```

### Passo 4: Adicionar ao Seletor de Idioma / Step 4: Add to Language Selector

Atualize os ficheiros de tradução para incluir o novo idioma no seletor:

Update translation files to include the new language in the selector:

**en.json:**
```json
{
  "settings": {
    "language": {
      "title": "Language",
      "select": "Select Language",
      "en": "English",
      "pt": "Portuguese",
      "es": "Spanish"
    }
  }
}
```

**pt.json:**
```json
{
  "settings": {
    "language": {
      "title": "Idioma",
      "select": "Selecionar Idioma",
      "en": "Inglês",
      "pt": "Português",
      "es": "Espanhol"
    }
  }
}
```

**es.json:**
```json
{
  "settings": {
    "language": {
      "title": "Idioma",
      "select": "Seleccionar Idioma",
      "en": "Inglés",
      "pt": "Portugués",
      "es": "Español"
    }
  }
}
```

### Passo 5: Atualizar o Componente LanguageSelector / Step 5: Update LanguageSelector Component

Adicione a opção no componente `src/components/LanguageSelector.tsx`:

Add the option in `src/components/LanguageSelector.tsx`:

```tsx
<select
  value={i18n.language}
  onChange={(e) => i18n.changeLanguage(e.target.value)}
  className="..."
>
  <option value="en">{t('settings.language.en')}</option>
  <option value="pt">{t('settings.language.pt')}</option>
  <option value="es">{t('settings.language.es')}</option> {/* Novo / New */}
</select>
```

## 📝 Boas Práticas / Best Practices

### ✅ Fazer / Do

- ✅ Sempre use chaves descritivas: `t('profile.settings.account.username')`
- ✅ Agrupe chaves relacionadas: `profile.settings.*`, `game.stats.*`
- ✅ Mantenha todos os idiomas sincronizados (mesma estrutura de chaves)
- ✅ Use traduções para TODOS os textos visíveis ao utilizador

### ❌ Não Fazer / Don't

- ❌ Não use strings hardcoded: ~~`<h1>Profile</h1>`~~ → Use `<h1>{t('profile.title')}</h1>`
- ❌ Não crie chaves duplicadas ou inconsistentes
- ❌ Não esqueça de traduzir mensagens de erro e feedback

## 🔍 Chaves Disponíveis / Available Keys

### Common (Comuns)
- `common.signIn`, `common.signOut`, `common.signUp`
- `common.email`, `common.password`, `common.username`
- `common.level`, `common.accuracy`, `common.wpm`
- `common.play`, `common.profile`, `common.leaderboard`, `common.settings`

### Landing Page
- `landing.hero.title`, `landing.hero.subtitle`, `landing.hero.tagline`
- `landing.features.improve.title`, `landing.features.track.title`
- `landing.whyChoose.title`, `landing.advancedFeatures.title`

### Auth (Autenticação)
- `auth.welcomeBack`, `auth.createAccount`
- `auth.enterEmail`, `auth.enterPassword`
- `auth.alreadyHaveAccount`, `auth.needAccount`

### Game (Jogo)
- `game.modes.title`, `game.modes.words`, `game.modes.sentences`
- `game.stats.level`, `game.stats.wpm`, `game.stats.accuracy`
- `game.actions.startTyping`, `game.actions.startNew`

### Profile (Perfil)
- `profile.title`, `profile.subtitle`
- `profile.overview`, `profile.achievements`, `profile.historyTab`, `profile.settingsTab`
- `profile.stats.level`, `profile.stats.wordsTyped`, `profile.stats.averageWPM`
- `profile.errors.load`, `profile.errors.updateUsername`
- `profile.settings.account.title`, `profile.settings.privacy.title`

### Dashboard
- `dashboard.title`, `dashboard.quickStats`, `dashboard.levelProgress`
- `dashboard.wordsTyped`, `dashboard.wpm`, `dashboard.accuracy`
- `dashboard.recentActivity`, `dashboard.timeSpentTyping`

### Leaderboard (Classificação)
- `leaderboard.title`, `leaderboard.noPlayers`, `leaderboard.startTyping`

### Settings (Configurações)
- `settings.language.title`, `settings.language.select`
- `settings.language.en`, `settings.language.pt`

## 🧪 Testar Traduções / Testing Translations

Para testar se todas as traduções estão a funcionar:

To test if all translations are working:

1. **Mude o idioma** no seletor de idioma
2. **Navegue por todas as páginas** para verificar se não há texto hardcoded
3. **Verifique erros** no console do navegador
4. **Compare ficheiros** para garantir que têm as mesmas chaves

## 🛠️ Ferramentas Úteis / Useful Tools

- **Verificar chaves em falta:** Compare `en.json` com `pt.json` para garantir que têm a mesma estrutura
- **Validar JSON:** Use um validador JSON online para verificar sintaxe
- **Deteção automática de idioma:** O sistema deteta automaticamente o idioma do navegador do utilizador

## 📚 Recursos / Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

---

**Nota:** Sempre teste as traduções antes de fazer commit! / Always test translations before committing!
