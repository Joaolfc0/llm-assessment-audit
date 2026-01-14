# AEA: Architectural Evaluation Audit

Uma aplicação web de página única (SPA) para auditoria de revisões técnicas de diagramas de arquitetura de software.

## 📋 Visão Geral

Esta ferramenta permite que avaliadores auditem análises geradas por LLMs (Large Language Models) sobre diagramas de arquitetura de microsserviços. O sistema apresenta 20 avaliações (combinações de modelos, formatos e critérios) em ordem aleatória para cada usuário.

## 🚀 Como Usar

### Para Avaliadores

1. Acesse a página inicial
2. Insira seu email (funciona como identificador único)
3. Siga as instruções para avaliar cada análise
4. O progresso é salvo automaticamente no navegador
5. Você pode sair e continuar depois usando o mesmo email

### Hospedagem no GitHub Pages

1. Faça push deste diretório `aea/` para seu repositório GitHub
2. Vá em Settings → Pages
3. Selecione a branch e o diretório `/aea` como source
4. O site estará disponível em `https://seu-usuario.github.io/seu-repo/aea/`

## 🔧 Configuração do Google Apps Script

Para coletar as respostas em uma planilha Google Sheets:

### 1. Criar o Apps Script

1. Abra o Google Sheets e crie uma nova planilha
2. Vá em **Extensões → Apps Script**
3. Substitua o código pelo seguinte:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Headers (primeira vez)
    if (sheet.getLastRow() === 0) {
      var headers = [
        'Timestamp', 'Email', 'Output ID', 'Model', 'Format', 'Criterion',
        'G1_ID', 'G1_Likert', 'G1_Issues', 'G1_Comment',
        'G2_ID', 'G2_Likert', 'G2_Issues', 'G2_Comment',
        'G3_ID', 'G3_Likert', 'G3_Issues', 'G3_Comment',
        'G4_ID', 'G4_Likert', 'G4_Issues', 'G4_Comment'
      ];
      sheet.appendRow(headers);
    }
    
    // Adicionar linha de dados
    var row = [
      data.timestamp || new Date().toISOString(),
      data.userEmail || '',
      data.outputId || '',
      data.model || '',
      data.format || '',
      data.criterion || '',
      data.g1_id || '', data.g1_likert || '', data.g1_issues || '', data.g1_comment || '',
      data.g2_id || '', data.g2_likert || '', data.g2_issues || '', data.g2_comment || '',
      data.g3_id || '', data.g3_likert || '', data.g3_issues || '', data.g3_comment || '',
      data.g4_id || '', data.g4_likert || '', data.g4_issues || '', data.g4_comment || ''
    ];
    
    sheet.appendRow(row);
    
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('AEA Data Collection is running!')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### 2. Implantar como Web App

1. Clique em **Implantar → Nova implantação**
2. Selecione tipo: **App da Web**
3. Configure:
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar**
5. Copie a URL do Web App

### 3. Configurar no App

1. Abra o arquivo `app.js`
2. Localize a linha:
   ```javascript
   GOOGLE_SCRIPT_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'
   ```
3. Substitua pela URL copiada:
   ```javascript
   GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/SEU_ID/exec'
   ```

## 📊 Estrutura dos Dados

### 20 Outputs Avaliados

| ID | Modelo | Formato | Critério |
|---|---|---|---|
| OUT_001 | ChatGPT | PNG | Accuracy |
| OUT_002 | ChatGPT | PNG | Clarity |
| OUT_003 | ChatGPT | PNG | Completeness |
| OUT_004 | ChatGPT | PNG | Consistency |
| OUT_005 | ChatGPT | PNG | Level of Detail |
| OUT_006 | ChatGPT | SVG | Accuracy |
| OUT_007 | ChatGPT | SVG | Clarity |
| OUT_008 | ChatGPT | SVG | Completeness |
| OUT_009 | ChatGPT | SVG | Consistency |
| OUT_010 | ChatGPT | SVG | Level of Detail |
| OUT_011 | Gemini | PNG | Accuracy |
| OUT_012 | Gemini | PNG | Clarity |
| OUT_013 | Gemini | PNG | Completeness |
| OUT_014 | Gemini | PNG | Consistency |
| OUT_015 | Gemini | PNG | Level of Detail |
| OUT_016 | Gemini | SVG | Accuracy |
| OUT_017 | Gemini | SVG | Clarity |
| OUT_018 | Gemini | SVG | Completeness |
| OUT_019 | Gemini | SVG | Consistency |
| OUT_020 | Gemini | SVG | Level of Detail |

### Critérios de Avaliação

1. **Accuracy** - Precisão das representações
2. **Clarity** - Clareza visual e textual
3. **Completeness** - Completude dos elementos
4. **Consistency** - Consistência da notação
5. **Level of Detail** - Nível apropriado de detalhe

### Campos Coletados por Guideline

- **Likert Score (1-5)**: Grau de concordância com a análise
- **Issues**: Tipos de problemas identificados
  - `correct`: Análise fiel e correta
  - `hallucination`: Alucinação de conteúdo
  - `omission`: Omissão grave
  - `misinterpretation`: Erro de interpretação
  - `contradiction`: Contradição interna
  - `vagueness`: Genericismo/Vagueza
- **Comment**: Comentário explicativo (obrigatório se houver erros)

## 🗂️ Estrutura de Arquivos

```
aea/
├── index.html      # Página principal
├── styles.css      # Estilos CSS
├── app.js          # Lógica da aplicação
├── data.js         # Dados das avaliações
└── README.md       # Este arquivo
```

## 💾 Armazenamento Local

O progresso do usuário é salvo no `localStorage` do navegador com a chave `aea_audit_data`. Isso inclui:

- Email do usuário
- Ordem embaralhada dos outputs
- Índice atual
- Todas as respostas já preenchidas

## 🎨 Design

- Layout split-view responsivo
- Estilo acadêmico profissional
- Fonte Inter para UI e Source Serif Pro para títulos
- Barra de progresso fixa no topo
- Scroll independente para cada painel

## 📝 Licença

Este projeto faz parte de uma pesquisa acadêmica sobre avaliação de arquitetura de software.
