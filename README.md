# Conversor de Moedas

Este projeto é um conversor de moedas simples construído com HTML, CSS e JavaScript puro. Ele consulta cotações reais usando a API Frankfurter (sem necessidade de chave).

## Estrutura
- `index.html` — interface do usuário
- `style.css` — estilos e tema claro/escuro automático
- `app.js` — lógica: busca de moedas, conversão, histórico no localStorage
- `README.md` — este arquivo
- `conversor-moedas.zip` — arquivo gerado (neste pacote)

## Como usar localmente
1. Extraia o conteúdo do ZIP (ou clone o repositório).
2. Abra `index.html` em um navegador moderno.
3. Opcional: use Live Server no VS Code para recarregamento ao editar.

## Funcionalidades
- Buscar lista de moedas dinâmica (API Frankfurter).
- Converter valores entre duas moedas.
- Botão para inverter moedas.
- Histórico local (últimas 6 conversões) salvo em `localStorage`.
- Tema claro/escuro automático conforme preferência do sistema.
- Tratamento de erros com mensagem amigável.

## API
O projeto usa `https://api.frankfurter.dev/v1` para:
- `/currencies` — lista de códigos e nomes de moedas.
- `/latest?base=FROM&symbols=TO` — taxa mais recente entre moedas.

https://github.com/Melettz1