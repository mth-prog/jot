# 📓 Work Journal

App desktop para anotações e log de trabalho voltado a profissionais de tecnologia.

## Stack

- **Electron** — shell desktop
- **React + TypeScript** — UI
- **SQLite** (better-sqlite3) — banco de dados local, offline-first
- **Markdown** (@uiw/react-md-editor) — editor com preview em tempo real
- **Tailwind CSS v4** — estilização

## Funcionalidades

- ✅ Criar, editar e excluir anotações
- ✅ Editor Markdown com preview ao vivo (split-view)
- ✅ Tags personalizadas (bug, feature, meeting, daily, deploy, etc.)
- ✅ Busca full-text (SQLite FTS5) por título e conteúdo
- ✅ Tema escuro focado em produtividade
- ✅ Dados 100% locais (arquivo `.db` em `userData`)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Reconstruir SQLite nativo para Electron
npm run rebuild

# Iniciar em modo dev
npm run dev
```

## Build

```bash
npm run build
```

O executável será gerado na pasta `dist/`.

## Estrutura do Projeto

```
src/
├── components/
│   ├── Sidebar.tsx     # Lista de entradas + busca
│   └── Editor.tsx      # Editor Markdown com tags
├── hooks/
│   └── useEntries.ts   # Hook de CRUD via IPC
├── types/
│   └── index.ts        # Tipos compartilhados
├── App.tsx             # Layout principal
└── index.css           # Tailwind + estilos globais

electron/
├── main.ts             # Processo principal + handlers IPC
├── preload.ts          # Bridge contextBridge (window.journal)
└── db.ts               # SQLite: schema + migrations + CRUD
```


This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
