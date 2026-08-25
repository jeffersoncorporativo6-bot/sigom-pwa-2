# SIGOM — PWA instalável (base para gerar o APK)

Este pacote transforma o protótipo do SIGOM num **PWA (Progressive Web App)**:
instalável, funciona offline com banco de dados local (IndexedDB), e sincroniza
quando a internet volta.

## Arquivos

```
index.html                 → aplicativo completo (HTML+CSS+JS+dados do KKS/Planos)
manifest.json               → nome, ícones e cores do app instalado
sw.js                       → service worker (cache offline + aviso de nova versão)
icons/icon-192.png
icons/icon-512.png
icons/icon-512-maskable.png
```

## O que já funciona

- **Instalável**: no Chrome/Android, abrir o link e escolher "Adicionar à tela inicial" ou "Instalar app" — vira um app com ícone próprio, sem barra de navegador.
- **Offline**: o Service Worker guarda o app inteiro em cache na primeira visita; depois disso, abre e funciona sem internet.
- **Banco de dados local**: cada Ordem de Serviço salva vai para o **IndexedDB** do aparelho (não se perde ao fechar o app ou recarregar a página).
- **Sincronização**: o selo no topo (ao lado do botão de modo escuro) mostra `Offline`, `X pendente(s)` ou `Sincronizado`. Quando o aparelho reconecta à internet, o app tenta sincronizar automaticamente as ordens pendentes.

  ⚠️ **Importante**: como ainda não existe um backend/servidor real por trás do protótipo, essa sincronização hoje é **simulada** (mostra o comportamento e o status, mas não envia para nenhum servidor de verdade). O ponto exato para plugar uma API real está marcado no código, na função `trySync()` dentro do `index.html` — troque o `setTimeout` por uma chamada `fetch()` para o seu endpoint quando o backend existir.
- **Atualizações**: se você publicar uma nova versão do app (trocar o `index.html`, por exemplo) e mudar o número em `CACHE_VERSION` dentro de `sw.js`, os usuários que já instalaram o app veem um aviso "Nova versão disponível" com botão para atualizar.

## Passo 1 — Hospedar o PWA (obrigatório antes do PWABuilder)

O PWABuilder.com **lê um site já publicado** (ele não aceita arquivos soltos do computador). É preciso colocar esses arquivos num endereço com HTTPS. Opções gratuitas mais simples:

- **GitHub Pages**: criar um repositório, subir esses arquivos, ativar Pages nas configurações do repositório.
- **Netlify** ou **Vercel**: arrastar a pasta inteira no painel deles (deploy manual, sem precisar de linha de comando).

Depois do deploy, você terá uma URL do tipo `https://seuapp.netlify.app`.

## Passo 2 — Gerar o APK no PWABuilder

1. Acesse **https://www.pwabuilder.com**
2. Cole a URL do app publicado e clique em **Start**
3. O PWABuilder vai validar o `manifest.json` e o `sw.js` (ambos já estão prontos aqui)
4. Na aba **Android**, clique em **Package for Store** (ou "Generate Package")
5. Baixe o pacote `.apk` (ou `.aab` para publicar na Play Store)
6. Para instalar no celular: ative "Instalar de fontes desconhecidas" e abra o `.apk` baixado

## Limitações deste protótipo

- Os dados de **KKS e Planos** (base de equipamentos) estão embutidos no próprio `index.html` — qualquer atualização da planilha exige gerar um novo `index.html` e publicar de novo.
- A sincronização com a nuvem é simulada, como explicado acima — não há hoje um servidor central juntando os dados de vários usuários/aparelhos.
- Fotos e anexos ficam apenas na memória da sessão (não são salvos no IndexedDB ainda) — se quiser que sobrevivam ao fechar o app, é um próximo passo natural.
