# Analisador de Espectro Político (Spectrum Sage)

 
*(Substitua pela URL de uma captura de tela do seu aplicativo)*

O **Analisador de Espectro Político** é uma aplicação web inteligente projetada para analisar o conteúdo de notícias e artigos, fornecendo uma visão multifacetada sobre seu viés político e nível de factualidade. Usando o poder do Google Gemini, a ferramenta ajuda os usuários a entenderem como diferentes espectros políticos (esquerda, centro, direita) abordariam o mesmo tópico.

## ✨ Funcionalidades

- **Análise por URL:** Cole o link de uma notícia e a aplicação extrairá o conteúdo automaticamente para análise.
- **Análise por Texto:** Cole diretamente o corpo de um texto para uma análise instantânea.
- **Análise por PDF:** Faça o upload de um arquivo PDF para extrair e analisar seu conteúdo.
- **Relatório de Análise Completo:**
    - **Viés Geral:** Classifica o artigo em uma escala de Esquerda, Centro-Esquerda, Centro, Centro-Direita e Direita.
    - **Nível de Factualidade:** Avalia a factualidade do conteúdo (Muito Alta, Alta, Mista, Baixa, Muito Baixa).
    - **Confiança da IA:** Mostra um indicador de confiança na análise de viés.
    - **Resumo Neutro:** Fornece um resumo conciso e imparcial dos pontos principais.
    - **Perspectivas Múltiplas:** Descreve como publicações de esquerda, centro e direita cobririam o mesmo assunto.

## 🚀 Tecnologias Utilizadas

- **Frontend:**
    - [Next.js](https://nextjs.org/) (App Router)
    - [React](https://react.dev/)
    - [TypeScript](https://www.typescriptlang.org/)
    - [Tailwind CSS](https://tailwindcss.com/)
    - [ShadCN UI](https://ui.shadcn.com/) para componentes de UI
- **Inteligência Artificial:**
    - [Google Gemini](https://deepmind.google/technologies/gemini/)
    - [Genkit (Firebase)](https://firebase.google.com/docs/genkit) para orquestração dos fluxos de IA
- **Hospedagem:**
    - [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)

## 🏁 Como Começar

Siga os passos abaixo para executar o projeto localmente.

### Pré-requisitos

- [Node.js](https://nodejs.org/en) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Uma chave de API para o Google Gemini. Você pode obtê-la no [Google AI Studio](https://aistudio.google.com/app/apikey).

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/your-username/your-repo-name.git
    cd your-repo-name
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um arquivo chamado `.env` na raiz do projeto.
    - Adicione sua chave da API do Gemini a ele:
      ```
      GEMINI_API_KEY=SUA_CHAVE_DE_API_AQUI
      ```

### Executando a Aplicação

1.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

2.  Abra seu navegador e acesse [http://localhost:9002](http://localhost:9002) para ver a aplicação em funcionamento.

## ☁️ Publicando o Projeto (Deploy)

Este projeto está configurado para ser publicado facilmente com o Firebase App Hosting.

1.  **Instale o Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```

2.  **Faça login na sua Conta Google:**
    ```bash
    firebase login
    ```

3.  **Inicialize o App Hosting:**
    Na raiz do seu projeto, execute o comando e siga as instruções para conectar-se a um projeto Firebase.
    ```bash
    firebase init apphosting
    ```
    *Lembre-se: é necessário ter um projeto Firebase com o plano "Blaze (pagamento por utilização)" ativado, embora você provavelmente permanecerá no nível gratuito.*

4.  **Publique sua aplicação:**
    ```bash
    firebase deploy
    ```
    Ao final, o CLI fornecerá a URL pública do seu aplicativo.
