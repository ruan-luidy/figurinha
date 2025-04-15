// Instalação das dependências necessárias:
// npm install whatsapp-web.js qrcode-terminal sharp fs

const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Criar pasta para armazenar imagens e stickers temporários
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Limpar arquivos antigos da pasta temp na inicialização
try {
  const files = fs.readdirSync(tempDir);
  console.log(`Encontrados ${files.length} arquivos temporários antigos.`);
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(tempDir, file));
    } catch (err) {
      // Ignorar erros ao tentar excluir arquivos antigos
    }
  }
  console.log('Limpeza inicial concluída.');
} catch (err) {
  console.log('Erro ao limpar arquivos temporários antigos:', err.message);
}

// Inicializar o cliente WhatsApp com autenticação persistente
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'sticker-maker-bot',
    dataPath: './whatsapp-session'
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-extensions'
    ]
  }
});

// Nome do grupo alvo para teste
const TARGET_GROUP_NAME = 'GRUPO DE GEOPOLÍTICA';
const TARGET_GROUP_NAME = 'teste-fofo';
let targetGroupId = null;

// Gerar QR Code para autenticação (só é necessário na primeira vez)
client.on('qr', (qr) => {
  console.log('QR RECEBIDO:');
  qrcode.generate(qr, { small: true });
  console.log('Escaneie o QR Code acima com seu WhatsApp para autenticar o bot');
  console.log('Você só precisará fazer isso uma vez, pois a sessão será salva');
});

client.on('authenticated', () => {
  console.log('Autenticado com sucesso!');
});

client.on('auth_failure', (error) => {
  console.error('Falha na autenticação:', error);
});

client.on('ready', async () => {
  console.log('Bot conectado e pronto!');
  
  // Buscar o grupo pelo nome
  const chats = await client.getChats();
  for (let chat of chats) {
    if (chat.isGroup && chat.name.toLowerCase().includes(TARGET_GROUP_NAME.toLowerCase())) {
      targetGroupId = chat.id._serialized;
      console.log(`Grupo "${TARGET_GROUP_NAME}" encontrado! ID: ${targetGroupId}`);
      break;
    }
  }
  
  if (targetGroupId) {
    console.log('Monitorando mensagens no grupo:', targetGroupId);
  } else {
    console.log(`AVISO: Grupo "${TARGET_GROUP_NAME}" não encontrado. Verifique se o nome está correto e se o bot é membro do grupo.`);
  }
});

// Função para converter imagem para sticker
async function convertToSticker(imagePath) {
  const stickerPath = path.join(tempDir, `sticker_${Date.now()}.webp`);

  try {
    // Obter informações da imagem original
    const metadata = await sharp(imagePath).metadata();
    let sharpInstance = sharp(imagePath);

    // Redimensionar apenas se exceder um tamanho máximo
    const MAX_DIMENSION = 1024;
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      sharpInstance = sharpInstance.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }

    await sharpInstance.toFormat('webp').toFile(stickerPath);
    return stickerPath;
  } catch (error) {
    console.error('Erro ao converter imagem:', error);
    return null;
  }
}

// Função para tentar programar a limpeza de arquivos temporários mais tarde
function scheduleFilesCleanup(files) {
  setTimeout(() => {
    for (const file of files) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
          console.log(`Arquivo temporário removido: ${file}`);
        }
      } catch (err) {
        // Simplesmente registrar o erro sem interromper o funcionamento
        console.log(`Não foi possível remover arquivo ${file}. Será removido automaticamente mais tarde.`);
      }
    }
  }, 5000); // Tentar limpar 5 segundos depois
}

// Listener para mensagens recebidas
client.on('message', async (message) => {
  // Verificar se é do grupo alvo
  if (targetGroupId && message.from === targetGroupId) {
    console.log('Mensagem recebida no grupo alvo');

    // Verificar se a mensagem contém mídia
    if (message.hasMedia) {
      console.log('Mensagem contém mídia, processando...');

      try {
        // Baixar mídia
        const media = await message.downloadMedia();
        
        // Verificar se é uma figurinha
        if (media.mimetype === 'image/webp') {
          console.log('Mídia recebida é uma figurinha');
          // Responder com a mensagem solicitada
          await message.reply('figura não pode.');
          return;
        }

        // Verificar se é uma imagem
        if (media.mimetype.startsWith('image/')) {
          console.log('Mídia é uma imagem, convertendo para sticker...');

          try {
            // Salvar a imagem temporariamente
            const imagePath = path.join(tempDir, `image_${Date.now()}.${media.mimetype.split('/')[1]}`);
            fs.writeFileSync(imagePath, Buffer.from(media.data, 'base64'));

            // Converter para sticker
            const stickerPath = await convertToSticker(imagePath);

            if (stickerPath) {
              try {
                // Criar sticker e enviar
                const stickerData = fs.readFileSync(stickerPath);
                const stickerMedia = new MessageMedia('image/webp', stickerData.toString('base64'));

                // Enviar como sticker
                await message.reply(stickerMedia, message.from, { sendMediaAsSticker: true });
                console.log('Sticker enviado com sucesso!');
                
                // Programar limpeza dos arquivos para mais tarde
                scheduleFilesCleanup([imagePath, stickerPath]);
              } catch (sendError) {
                console.error('Erro ao enviar sticker:', sendError.message);
                message.reply('Desculpe, ocorreu um erro ao enviar a figurinha.');
              }
            } else {
              message.reply('Desculpe, não consegui converter esta imagem em figurinha.');
            }
          } catch (conversionError) {
            console.error('Erro ao processar imagem:', conversionError.message);
            message.reply('Desculpe, ocorreu um erro ao processar a imagem.');
          }
        } else {
          console.log('Mídia não é uma imagem ou figurinha, ignorando.');
        }
      } catch (mediaError) {
        console.error('Erro ao baixar mídia:', mediaError.message);
        // Não enviar mensagem de erro ao usuário se for erro ao baixar
      }
    }
  }
});

// Implementar limpeza periódica da pasta temp (a cada 1 hora)
setInterval(() => {
  console.log('Iniciando limpeza periódica de arquivos temporários...');
  try {
    const files = fs.readdirSync(tempDir);
    let deleted = 0;
    
    for (const file of files) {
      try {
        fs.unlinkSync(path.join(tempDir, file));
        deleted++;
      } catch (err) {
        // Ignorar erros ao tentar excluir arquivos
      }
    }
    
    console.log(`Limpeza periódica concluída. Removidos ${deleted} arquivos.`);
  } catch (err) {
    console.log('Erro durante limpeza periódica:', err.message);
  }
}, 60 * 60 * 1000); // 1 hora

// Manipulação de reconexão
client.on('disconnected', (reason) => {
  console.log('Cliente desconectado:', reason);
  console.log('Tentando reconectar em 10 segundos...');
  setTimeout(() => {
    client.initialize();
  }, 10000);
});

// Iniciar o cliente
client.initialize();

// Gerenciamento de erros
process.on('SIGINT', async () => {
  console.log('Encerrando bot...');
  await client.destroy();
  process.exit(0);
});