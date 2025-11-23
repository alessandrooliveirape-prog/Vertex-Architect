# 🏛️ Vertex Architect - Prompt Engineering Studio

![Project Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Tailwind%20%7C%20Gemini-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **Transforme ideias simples em Engenharia de Prompt de precisão cirúrgica.**

O **Vertex Architect** é uma IDE (Ambiente de Desenvolvimento Integrado) web para criação, otimização e execução de prompts complexos para LLMs (Large Language Models). Diferente de chats comuns, esta ferramenta foi desenhada para **Engenheiros de Prompt**, permitindo construir instruções estruturadas, controlar temperatura, medir custos de tokens e executar testes em tempo real.

---

## 🎯 O Problema
Interagir com IAs generativas usando apenas frases soltas ("crie um texto") gera resultados medíocres. Para obter resultados profissionais, é necessário usar **Personas, Contexto, Restrições e Formatação** (Engenharia de Prompt). Fazer isso manualmente é repetitivo e propenso a erros.

## 🚀 A Solução
O **Vertex Architect** atua como uma camada intermediária inteligente. Você insere uma ideia vaga, e o sistema utiliza uma "Meta-Instrução" (System Instruction) de elite para arquitetar um **Super Prompt**. Em seguida, você pode executar esse prompt instantaneamente para ver o resultado final.

---

## ✨ Funcionalidades Principais

*   **🧠 Arquitetura de 2 Etapas:**
    1.  **Geração:** Cria o "Super Prompt" estruturado (Persona, Contexto, Tarefas).
    2.  **Execução:** Roda o prompt criado para gerar o resultado final (Código, Artigo, JSON, etc).
*   **🔑 Bring Your Own Key (BYOK):** A arquitetura é 100% Client-Side. Sua API Key do Google fica salva apenas no seu navegador (LocalStorage), garantindo segurança e privacidade.
*   **📊 Telemetria em Tempo Real:** Visualização ao vivo de contagem de caracteres, estimativa de Tokens e Custo (baseado no pricing do Gemini 1.5 Flash).
*   **🎨 UI/UX Profissional:** Interface "Split Screen" inspirada em editores de código (VS Code), com tema Dark Mode e Syntax Highlighting.
*   **📎 Suporte Multimodal:** Anexe imagens ou PDFs para gerar prompts baseados em análise visual e documental.
*   **💾 Histórico Local:** Seus projetos são salvos automaticamente no navegador.
*   **📥 Exportação:** Baixe seus prompts e resultados em formato Markdown (`.md`).

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** React 19, TypeScript, Vite.
*   **Estilização:** Tailwind CSS, Lucide React (Ícones).
*   **IA Core:** Google Gemini API (`@google/genai` SDK) - Modelo `gemini-2.5-flash`.
*   **Fontes:** Inter (Interface) & JetBrains Mono (Código).

---

## 🔐 Configuração da API Key

Para usar o Vertex Architect, você precisará de uma chave de API gratuita do Google AI Studio:

1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Clique em **"Create API Key"**.
3. No Vertex Architect, clique no botão **"Configurar"** no canto superior esquerdo.
4. Cole sua chave. Ela será salva localmente no seu dispositivo.

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir Issues ou enviar Pull Requests.

---

## 👨‍💻 Autoria e Créditos

Este projeto foi desenvolvido com foco em **Arquitetura de Soluções de IA**.

*   **Desenvolvedor:** Alessandro Oliveira
*   **Empresa:** [1007 Studios](https://github.com/1007studios)
*   **Conceito:** Ferramenta de produtividade para profissionais de IA Generativa.

---

<p align="center">
  Feito com ❤️ por 1007 Studios © 2024
</p>