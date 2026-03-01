<p align="center">
  <img src="logo.png" alt="Jot" width="96" />
</p>

# Work Journal

Um app desktop para anotações e log de trabalho, feito para profissionais de tecnologia. Seus registros ficam 100% locais — sem nuvem, sem assinatura, sem rastreamento.

[![Electron](https://img.shields.io/badge/Electron-30-47848f?style=flat-square&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-FTS5-003b57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Visão Geral

Work Journal é um diário de trabalho offline-first para devs e pessoas de tech que precisam registrar o dia a dia — tarefas, bugs, deploys, reuniões, ideias. Tudo salvo localmente em um arquivo `.db`, sem dependência de internet.

## Funcionalidades

- **Offline-first** — Todos os dados ficam no seu computador. Sem nuvem, sem login.
- **Markdown nativo** — Editor com preview em tempo real e suporte completo a Markdown.
- **Tags personalizadas** — Categorize entradas com tags como `bug`, `feature`, `meeting`, `deploy`, etc.
- **Busca full-text** — Pesquisa rápida por título e conteúdo via SQLite FTS5.
- **Tema escuro** — Interface focada em produtividade, construída com Tailwind CSS v4.
- **Calendário** — Navegue pelas anotações organizadas por data.

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

O instalador será gerado na pasta `release/`.

## Estrutura do Projeto

```
src/
├── components/       # NavBar, Sidebar, Editor, etc.
├── hooks/
│   └── useEntries.ts # Hook de CRUD via IPC
├── types/
│   └── index.ts      # Tipos compartilhados
├── App.tsx           # Layout principal
└── index.css         # Tailwind + estilos globais

electron/
├── main.ts           # Processo principal + handlers IPC
├── preload.ts        # Bridge contextBridge (window.journal)
└── db.ts             # SQLite: schema + migrations + CRUD
```

## Stack

| Tecnologia | Uso |
|---|---|
| [Electron](https://www.electronjs.org/) | Shell desktop multiplataforma |
| [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) | Interface |
| [SQLite](https://www.sqlite.org/) (better-sqlite3) | Banco de dados local, FTS5 |
| [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) | Editor Markdown |
| [Tailwind CSS v4](https://tailwindcss.com/) | Estilização |
| [Vite](https://vitejs.dev/) | Build e dev server |

## Licença

Work Journal é distribuído sob a [licença MIT](LICENSE).

---

**Feito com ☕ para quem documenta o próprio trabalho.**
