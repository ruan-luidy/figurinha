# 🤖 WhatsApp Sticker Bot

> Um bot poderoso e personalizável que transforma automaticamente imagens em figurinhas no WhatsApp

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Características

- 🖼️ **Conversão automática**: Transforma qualquer imagem em figurinha instantaneamente
- 🔄 **Autenticação persistente**: Login único - sem precisar escanear QR code repetidamente
- 👥 **Focado em grupos**: Monitora grupos específicos para maior eficiência
- 🔍 **Detector de figurinhas**: Responde de forma personalizada quando recebe figurinhas
- 🧹 **Limpeza automática**: Gerenciamento inteligente de arquivos temporários
- 💪 **Confiável**: Tratamento robusto de erros e reconexão automática

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) (v14 ou superior)
- Conexão estável com a internet
- Um número de WhatsApp ativo para o bot
- Permissão para entrar nos grupos alvo

## 🚀 Instalação

1. **Clone o repositório ou crie uma pasta para o projeto**

2. **Instale as dependências necessárias**:
   ```bash
   npm install whatsapp-web.js qrcode-terminal sharp fs
   ```

3. **Crie o arquivo principal** (por exemplo, `sticker-bot.js`) e cole o código do bot

4. **Configure o nome do grupo alvo**:
   Abra o arquivo e modifique a linha:
   ```javascript
   const TARGET_GROUP_NAME = 'grupomemes';
   ```
   Substitua 'grupomemes' pelo nome do grupo que você deseja monitorar.

## 🎮 Como usar

1. **Inicie o bot**:
   ```bash
   node sticker-bot.js
   ```

2. **Na primeira execução**, um QR code será exibido no terminal. Escaneie-o com seu WhatsApp seguindo estas etapas:
   - Abra o WhatsApp no seu celular
   - Vá em Configurações > Dispositivos vinculados
   - Toque em "Vincular um dispositivo"
   - Escaneie o QR code do terminal

3. **Adicione o bot ao grupo alvo** (se ainda não estiver)

4. **Envie imagens no grupo** e o bot automaticamente as transformará em figurinhas

5. **Envie figurinhas** para o grupo e receba a resposta personalizada configurada

## ⚙️ Personalização

### Resposta a figurinhas recebidas

Você pode facilmente personalizar a mensagem que o bot envia quando recebe uma figurinha:

```javascript
// Localize esta parte do código:
if (media.mimetype === 'image/webp') {
  console.log('Mídia recebida é uma figurinha');
  // Altere a mensagem abaixo conforme desejar:
  await message.reply('vai toma no cu jesse');
  return;
}
```

### Monitorar múltiplos grupos

Para monitorar múltiplos grupos, você pode modificar a função de busca de grupos:

```javascript
// Exemplo para monitorar vários grupos
const TARGET_GROUP_NAMES = ['grupomemes', 'outro-grupo', 'mais-um-grupo'];
let targetGroupIds = [];

client.on('ready', async () => {
  console.log('Bot conectado e pronto!');
  
  // Buscar os grupos pelo nome
  const chats = await client.getChats();
  for (let chat of chats) {
    if (chat.isGroup) {
      for (const groupName of TARGET_GROUP_NAMES) {
        if (chat.name.toLowerCase().includes(groupName.toLowerCase())) {
          targetGroupIds.push(chat.id._serialized);
          console.log(`Grupo "${chat.name}" encontrado! ID: ${chat.id._serialized}`);
          break;
        }
      }
    }
  }
  
  if (targetGroupIds.length > 0) {
    console.log(`Monitorando ${targetGroupIds.length} grupos`);
  } else {
    console.log(`AVISO: Nenhum grupo alvo encontrado.`);
  }
});

// Depois modifique a verificação de grupo na função message:
if (targetGroupIds.includes(message.from)) {
  // processamento da mensagem
}
```

## 🔧 Solução de problemas

### O bot não se conecta ou se desconecta frequentemente

1. Verifique sua conexão com a internet
2. Certifique-se de que o WhatsApp no seu celular está online
3. Reinicie o bot e escaneie o QR code novamente
4. Exclua a pasta `whatsapp-session` e tente novamente com uma sessão nova

### O bot não cria figurinhas

1. Certifique-se de que a pasta `temp` existe e tem permissões de escrita
2. Verifique se todas as dependências foram instaladas corretamente
3. Confirme que a imagem enviada é de um formato válido (JPG, PNG, etc.)

### O bot não responde às figurinhas

1. Verifique se o grupo corresponde exatamente ao configurado em `TARGET_GROUP_NAME`
2. Certifique-se de que a figurinha enviada é realmente uma figurinha (mime type `image/webp`)

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🌟 Agradecimentos

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) - API não oficial do WhatsApp Web
- [sharp](https://github.com/lovell/sharp) - Processamento de imagens de alta performance para Node.js
- [qrcode-terminal](https://github.com/gtanner/qrcode-terminal) - Geração de QR Code no terminal

---

## 📊 Estatísticas do Projeto

- **Tempo de desenvolvimento**: 3 dias
- **Linhas de código**: ~300
- **Dependências**: 4

---

🚀 **Desenvolvido com ❤️ para facilitar sua vida no WhatsApp**

*Sinta-se à vontade para contribuir com este projeto através de pull requests!*
