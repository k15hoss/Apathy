const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const config = require('./config.json');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.on('messageCreate', async message => {
  const newLocal = '!embed';
if (message.content === newLocal) {
    const embed = new EmbedBuilder()
      .setTitle('Путь в семью начинается здесь!')
      .setDescription(`- Уведомление о приглашении на обзвон обычно отправляется в личные сообщения. Если ЛС закрыты, оно отправляется в канал — ⁠https://discord.com/channels/1430385406393716768/1430385406393716771 ⁠. В этот канал также приходят уведомления об отказе в наборе.\n\n:pushpin: FAQ:\n - Минимальный возраст подачи заявки 16 лет.\n - Заявки рассматриваются 24 часа.\n - Откат с арены принимается\nдо недели (тяжка/сайга).\n - Откат с капта/мцл принимается\nдо месяца.\n\n\n:grey_exclamation: В ЛС писать всем подряд не нужно,\nэто никак не ускорит рассмотрение.`)
      .setColor(0x000000) // Black frame
      .setImage('attachment://123.png');

    const button = new ButtonBuilder()
      .setCustomId('submit_application')
      .setLabel('Подать заявку')
      .setStyle(ButtonStyle.Secondary); // Black button

    const row = new ActionRowBuilder().addComponents(button);

    const channel = client.channels.cache.get(config.channel_ids[0]);
    if (channel) {
      await channel.send({ embeds: [embed], components: [row], files: ['C:/Users/K15HO/Downloads/123.png'] });
    } else {
      await message.channel.send('Error: Application channel not found.');
    }
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    if (interaction.customId === 'submit_application') {
      const modal = new ModalBuilder()
        .setCustomId('application_modal')
        .setTitle('Новая заявка');

      const nameInput = new TextInputBuilder()
        .setCustomId('name')
        .setLabel('Имя / Статик / Возраст')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const onlineInput = new TextInputBuilder()
        .setCustomId('online')
        .setLabel('Онлайн / Часовой пояс')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const levelInput = new TextInputBuilder()
        .setCustomId('level')
        .setLabel('Лвл персонажа / Опыт игры')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const screenshotInput = new TextInputBuilder()
        .setCustomId('screenshot')
        .setLabel('Скриншот персонажей')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const rollbackInput = new TextInputBuilder()
        .setCustomId('rollback')
        .setLabel('Откат с ГГ (обязательно)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
      const secondActionRow = new ActionRowBuilder().addComponents(onlineInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(levelInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(screenshotInput);
      const fifthActionRow = new ActionRowBuilder().addComponents(rollbackInput);

      modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

      await interaction.showModal(modal);
    } else if (interaction.customId === 'accept') {
      const embed = interaction.message.embeds[0];
      const applicantUsername = embed.data.footer.text.split(': ')[1];
      const applicantMember = interaction.guild.members.cache.find(m => m.user.username === applicantUsername);

      if (applicantMember) {
        try {
          await applicantMember.roles.add('1430390957370638456'); // new role
          await applicantMember.roles.add('1430390964996014133'); // apathy role
          await applicantMember.roles.add('1435203705027694703'); // Academ role
        } catch (error) {
          console.error('Error adding roles:', error);
        }
      }

      const acceptedEmbed = new EmbedBuilder()
        .setTitle('Заявка принята')
        .setDescription(`Пользователь <@${applicantMember?.user.id}> принят.`)
        .setColor(0x00ff00)
        .setFooter({ text: `Рассмотрел анкету <@${interaction.user.id}>` });

      const resultChannel = client.channels.cache.get(config.result_channel);
      if (resultChannel) {
        await resultChannel.send({ embeds: [acceptedEmbed] });
      }

      await interaction.update({ embeds: [acceptedEmbed], components: [] });
    } else if (interaction.customId === 'reject') {
      const embed = interaction.message.embeds[0];
      const applicantUsername = embed.data.footer.text.split(': ')[1];
      const applicantMember = interaction.guild.members.cache.find(m => m.user.username === applicantUsername);

      const modal = new ModalBuilder()
        .setCustomId('reject_reason_modal')
        .setTitle('Причина отклонения');

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Укажите причину отклонения')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const firstActionRow = new ActionRowBuilder().addComponents(reasonInput);

      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);
    } else if (interaction.customId === 'call') {
      const embed = interaction.message.embeds[0];
      const applicantUsername = embed.data.footer.text.split(': ')[1];
      const applicantMember = interaction.guild.members.cache.find(m => m.user.username === applicantUsername);

      const voiceChannels = interaction.guild.channels.cache.filter(ch => ch.type === 2);
      const options = voiceChannels.map(ch => ({
        label: ch.name,
        value: ch.id
      }));

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`voice_channel_select_${applicantMember.user.id}`)
        .setPlaceholder('Выберите голосовой канал')
        .addOptions(options);

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({ content: 'Выберите голосовой канал для обзвона:', components: [row], ephemeral: true });
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === 'application_modal') {
      const name = interaction.fields.getTextInputValue('name');
      const online = interaction.fields.getTextInputValue('online');
      const level = interaction.fields.getTextInputValue('level');
      const screenshot = interaction.fields.getTextInputValue('screenshot');
      const rollback = interaction.fields.getTextInputValue('rollback');

      const applicationEmbed = new EmbedBuilder()
        .setTitle('Новая заявка')
        .setDescription(`**Имя / Статик / Возраст**\n${name}\n\n**Онлайн / Часовой пояс**\n${online}\n\n**Лвл персонажа / Опыт игры**\n${level}\n\n**Скриншот персонажей**\n${screenshot}\n\n**Откат с ГГ**\n${rollback}`)
        .setColor(0x0099ff)
        .setFooter({ text: `Заявитель: ${interaction.user.username}` });

      const acceptButton = new ButtonBuilder()
        .setCustomId('accept')
        .setLabel('Принять')
        .setStyle(ButtonStyle.Success);

      const rejectButton = new ButtonBuilder()
        .setCustomId('reject')
        .setLabel('Отклонить')
        .setStyle(ButtonStyle.Danger);

      const callButton = new ButtonBuilder()
        .setCustomId('call')
        .setLabel('Обзвон')
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(acceptButton, rejectButton, callButton);

      const reviewChannel = client.channels.cache.get(config.review_channel);
      if (reviewChannel) {
        await reviewChannel.send({ embeds: [applicationEmbed], components: [row] });
      }

      await interaction.reply({ content: 'Ваша заявка отправлена на рассмотрение!', ephemeral: true });
    } else if (interaction.customId === 'reject_reason_modal') {
      const reason = interaction.fields.getTextInputValue('reason');
      const embed = interaction.message.embeds[0];
      const applicantUsername = embed.data.footer.text.split(': ')[1];
      const applicantId = interaction.guild.members.cache.find(m => m.user.username === applicantUsername)?.user.id;

      const rejectedEmbed = new EmbedBuilder()
        .setTitle('Заявка отклонена')
        .setDescription(`Пользователь <@${applicantId}> отклонен.\n**Причина:** ${reason}`)
        .setColor(0xff0000)
        .setFooter({ text: `Рассмотрел анкету @${interaction.user.username}` });

      const resultChannel = client.channels.cache.get(config.result_channel);
      if (resultChannel) {
        await resultChannel.send({ embeds: [rejectedEmbed] });
      }

      await interaction.update({ embeds: [rejectedEmbed], components: [] });
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith('voice_channel_select_')) {
      const applicantId = interaction.customId.split('_')[3];
      const applicant = await client.users.fetch(applicantId);
      const channelId = interaction.values[0];
      const channel = interaction.guild.channels.cache.get(channelId);

      const callEmbed = new EmbedBuilder()
        .setTitle('Приглашение на обзвон')
        .setDescription(`Вы приглашены на обзвон в канал <#${channelId}>`)
        .setColor(0x000000);

      try {
        await applicant.send({ embeds: [callEmbed] });
        await interaction.update({ content: 'Приглашение отправлено в ЛС!', components: [] });
      } catch (error) {
        await interaction.update({ content: 'Не удалось отправить приглашение в ЛС. Возможно, ЛС закрыты.', components: [] });
      }
    }
  }
});

client.login(config.bot_token);
