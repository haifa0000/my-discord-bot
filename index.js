const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, AttachmentBuilder } = require('discord.js');
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = require('./config');  // ← صحيح الآن;
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const pendingRoles = new Map();

client.once(Events.ClientReady, () => {
  console.log(`✨ Logged in as ${client.user.tag}`);
});

client.on('error', error => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

client.on(Events.InteractionCreate, async interaction => {
  try {
  if (interaction.isChatInputCommand()) {
    
    if (interaction.commandName === 'ping') {
      const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      const apiLatency = Math.round(client.ws.ping);
      
      const embed = new EmbedBuilder()
        .setColor('#00FF9F')
        .setTitle('🏓 Pong! Bot Status')
        .setDescription('```ansi\n[2;32m█████████████████████[0m 100%\n```\n✨ **Bot is running smoothly!**')
        .addFields(
          { name: '⚡ Response Time', value: `\`${latency}ms\``, inline: true },
          { name: '💓 API Latency', value: `\`${apiLatency}ms\``, inline: true },
          { name: '🌐 Status', value: '`🟢 Online`', inline: true },
          { name: '🎭 Servers', value: `\`${client.guilds.cache.size}\``, inline: true },
          { name: '👥 Users', value: `\`${client.users.cache.size}\``, inline: true },
          { name: '⏰ Uptime', value: `\`${Math.floor(client.uptime / 60000)}m\``, inline: true }
        )
        .setFooter({ text: '✨ All systems operational', iconURL: client.user.displayAvatarURL() })
        .setTimestamp();
      
      await interaction.editReply({ content: '', embeds: [embed] });
    }
    
    if (interaction.commandName === 'help') {
      const bannerImage = new AttachmentBuilder('attached_assets/help-banner.png', { name: 'banner.png' });
      
      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎭 Role Management Bot - Command Guide')
        .setDescription('```ansi\n[2;35m╔══════════════════════════════════╗[0m\n[2;35m║[0m  [1;36mYour Ultimate Role Assistant[0m    [2;35m║[0m\n[2;35m╚══════════════════════════════════╝[0m\n```\n*Master the art of role management with these powerful commands!*')
        .addFields(
          { 
            name: '⚡ **Quick Actions**', 
            value: '```yaml\n/ping: Check bot status and performance\n/help: Display this beautiful guide\n```', 
            inline: false 
          },
          { 
            name: '👑 **Admin Commands**', 
            value: '```yaml\n/giverole: Assign a role to any user\n/removerole: Remove a role from a user\n/deleterole: Permanently delete a role\n```', 
            inline: false 
          },
          { 
            name: '🎨 **Role Creation**', 
            value: '```yaml\n/createrole: Create custom colored roles\n/setuproles: Auto-create 10 beautiful roles\n/coloringrole: Set your personal color\n```', 
            inline: false 
          },
          { 
            name: '📋 **Information & Management**', 
            value: '```yaml\n/listroles: View all server roles\n/rolemenu: Interactive role picker menu\n/stats: View detailed bot statistics\n```', 
            inline: false 
          }
        )
        .setImage('attachment://banner.png')
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: '💫 Powered by Discord.js | Made with ❤️', iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🎨 Quick Setup')
            .setCustomId('quick_setup_guide')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setLabel('💡 Tips & Tricks')
            .setCustomId('tips_tricks')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setLabel('📚 Documentation')
            .setURL('https://discord.js.org/')
            .setStyle(ButtonStyle.Link)
        );
      
      await interaction.reply({ embeds: [embed], components: [buttonRow], files: [bannerImage] });
    }
    
    if (interaction.commandName === 'stats') {
      await interaction.deferReply();
      
      const totalRoles = interaction.guild.roles.cache.size - 1;
      const totalMembers = interaction.guild.memberCount;
      const coloredRoles = interaction.guild.roles.cache.filter(r => r.color !== 0).size;
      const roleUsage = interaction.guild.roles.cache
        .filter(r => r.name !== '@everyone')
        .reduce((acc, role) => acc + role.members.size, 0);
      
      const avgRolesPerMember = totalMembers > 0 ? (roleUsage / totalMembers).toFixed(1) : '0.0';
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('📊 Server Statistics Dashboard')
        .setDescription('```ansi\n[2;33m▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰[0m\n```\n✨ **Comprehensive server analytics**')
        .addFields(
          { name: '🎭 Total Roles', value: `\`\`\`fix\n${totalRoles} roles\n\`\`\``, inline: true },
          { name: '🌈 Colored Roles', value: `\`\`\`fix\n${coloredRoles} roles\n\`\`\``, inline: true },
          { name: '👥 Server Members', value: `\`\`\`fix\n${totalMembers} members\n\`\`\``, inline: true },
          { name: '📈 Role Assignments', value: `\`\`\`fix\n${roleUsage} total\n\`\`\``, inline: true },
          { name: '💎 Avg Roles/Member', value: `\`\`\`fix\n${avgRolesPerMember}\n\`\`\``, inline: true },
          { name: '⚡ Bot Uptime', value: `\`\`\`fix\n${Math.floor(client.uptime / 60000)}m\n\`\`\``, inline: true }
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({ text: `${interaction.guild.name} • Data updated in real-time`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [embed] });
    }
    
    if (interaction.commandName === 'giverole') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);
      
      const loadingEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⏳ Processing Role Assignment...')
        .setDescription(`\`\`\`ansi\n[2;34m▰▰▰▱▱▱▱▱▱▱[0m 30%\n\`\`\`\n🎭 Preparing to give **${role.name}** to **${user.tag}**...`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadingEmbed] });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const progressEmbed = new EmbedBuilder()
        .setColor('#00BFFF')
        .setTitle('⚡ Assigning Role...')
        .setDescription(`\`\`\`ansi\n[2;36m▰▰▰▰▰▰▰▱▱▱[0m 70%\n\`\`\`\n✨ Updating permissions and settings...`)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [progressEmbed] });
      
      try {
        await member.roles.add(role);
        
        await new Promise(resolve => setTimeout(resolve, 600));
        
        const successEmbed = new EmbedBuilder()
          .setColor(role.color || '#00FF00')
          .setTitle('🎉 Role Successfully Assigned!')
          .setDescription(`╔═══════════════════════════════╗\n║   **ROLE ASSIGNMENT COMPLETE**   ║\n╚═══════════════════════════════╝\n\n✨ **${user.tag}** now has the sparkly **${role.name}** role!\n\n🌟 *New powers unlocked!*`)
          .addFields(
            { name: '👤 User', value: `<@${user.id}>`, inline: true },
            { name: '🎭 Role', value: `<@&${role.id}>`, inline: true },
            { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '📊 Progress', value: '```ansi\n[2;32m▰▰▰▰▰▰▰▰▰▰[0m 100%\n```', inline: false }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Assigned by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        const celebrateButton = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('celebrate_role')
              .setLabel('🎊 Celebrate!')
              .setStyle(ButtonStyle.Success)
          );
        
        await interaction.editReply({ embeds: [successEmbed], components: [celebrateButton] });
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Role Assignment Failed!')
          .setDescription(`\`\`\`diff\n- ERROR: ${error.message}\n\`\`\``)
          .setTimestamp();
        await interaction.editReply({ embeds: [errorEmbed], components: [] });
      }
    }
    
    if (interaction.commandName === 'removerole') {
      const user = interaction.options.getUser('user');
      const role = interaction.options.getRole('role');
      const member = await interaction.guild.members.fetch(user.id);
      
      const loadingEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('⏳ Processing Role Removal...')
        .setDescription(`\`\`\`ansi\n[2;33m▰▰▰▱▱▱▱▱▱▱[0m 30%\n\`\`\`\n🎭 Preparing to remove **${role.name}** from **${user.tag}**...`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadingEmbed] });
      
      await new Promise(resolve => setTimeout(resolve, 700));
      
      try {
        await member.roles.remove(role);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const successEmbed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('🗑️ Role Successfully Removed!')
          .setDescription(`╔═══════════════════════════════╗\n║   **ROLE REMOVAL COMPLETE**   ║\n╚═══════════════════════════════╝\n\n🔓 **${user.tag}** no longer has the **${role.name}** role.\n\n📉 *Permissions updated!*`)
          .addFields(
            { name: '👤 User', value: `<@${user.id}>`, inline: true },
            { name: '🎭 Role', value: `${role.name}`, inline: true },
            { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '📊 Progress', value: '```ansi\n[2;31m▰▰▰▰▰▰▰▰▰▰[0m 100%\n```', inline: false }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Removed by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Role Removal Failed!')
          .setDescription(`\`\`\`diff\n- ERROR: ${error.message}\n\`\`\``)
          .setTimestamp();
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }

    if (interaction.commandName === 'setuproles') {
      const startEmbed = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('🎨 Setting Up Colorful Roles...')
        .setDescription('```ansi\n[2;35m▰▰▱▱▱▱▱▱▱▱[0m 20%\n```\n✨ **Initializing role creation...**\n\nPreparing to create 10 beautiful roles for your server!')
        .setTimestamp();
      
      await interaction.reply({ embeds: [startEmbed] });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const rolesToCreate = [
        { name: '👑 Admin', color: '#FF0000', emoji: '👑', desc: 'Bold Red' },
        { name: '🛡️ Moderator', color: '#FFA500', emoji: '🛡️', desc: 'Warm Orange' },
        { name: '⭐ VIP', color: '#FFD700', emoji: '⭐', desc: 'Golden Yellow' },
        { name: '💎 Premium', color: '#00FFFF', emoji: '💎', desc: 'Cyan Blue' },
        { name: '🎮 Gamer', color: '#9B59B6', emoji: '🎮', desc: 'Royal Purple' },
        { name: '🎨 Artist', color: '#E91E63', emoji: '🎨', desc: 'Hot Pink' },
        { name: '💻 Developer', color: '#2ECC71', emoji: '💻', desc: 'Fresh Green' },
        { name: '🎵 Music Lover', color: '#1ABC9C', emoji: '🎵', desc: 'Turquoise' },
        { name: '📚 Scholar', color: '#3498DB', emoji: '📚', desc: 'Sky Blue' },
        { name: '🌟 Member', color: '#95A5A6', emoji: '🌟', desc: 'Cool Gray' }
      ];

      const progressEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('⚙️ Creating Roles...')
        .setDescription('```ansi\n[2;33m▰▰▰▰▰▰▱▱▱▱[0m 60%\n```\n🔨 **Building your role collection...**\n\nAdding colors and permissions to each role!')
        .setTimestamp();
      
      await interaction.editReply({ embeds: [progressEmbed] });

      const createdRoles = [];
      const failedRoles = [];

      for (const roleData of rolesToCreate) {
        try {
          const existingRole = interaction.guild.roles.cache.find(r => r.name === roleData.name);
          if (!existingRole) {
            await interaction.guild.roles.create({
              name: roleData.name,
              color: roleData.color,
              reason: 'Setup colorful roles'
            });
            createdRoles.push(`${roleData.emoji} **${roleData.name}** \`${roleData.desc}\``);
          } else {
            failedRoles.push(roleData.name + ' (already exists)');
          }
        } catch (error) {
          failedRoles.push(roleData.name + ' (error)');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      const successEmbed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🎉 Colorful Roles Setup Complete!')
        .setDescription('```ansi\n[2;32m▰▰▰▰▰▰▰▰▰▰[0m 100%\n```\n╔═══════════════════════════════════╗\n║  **🌈 ROLE CREATION SUCCESSFUL**  ║\n╚═══════════════════════════════════╝\n\n✨ Your server now has a beautiful collection of colored roles!')
        .setTimestamp();

      if (createdRoles.length > 0) {
        successEmbed.addFields({ 
          name: '✅ Successfully Created', 
          value: createdRoles.join('\n'),
          inline: false 
        });
      }
      if (failedRoles.length > 0) {
        successEmbed.addFields({ 
          name: '⚠️ Skipped', 
          value: failedRoles.join('\n'),
          inline: false 
        });
      }

      successEmbed.setFooter({ text: `Created by ${interaction.user.tag} | Use /rolemenu to let users pick roles!`, iconURL: interaction.user.displayAvatarURL() });

      await interaction.editReply({ embeds: [successEmbed] });
    }

    if (interaction.commandName === 'createrole') {
      await interaction.deferReply();
      
      const name = interaction.options.getString('name');
      
      const colorOptions = [
        { label: '🔴 Red', value: '#FF0000', emoji: '🔴', description: 'Bold and powerful' },
        { label: '🟠 Orange', value: '#FF8800', emoji: '🟠', description: 'Warm and energetic' },
        { label: '🟡 Yellow', value: '#FFFF00', emoji: '🟡', description: 'Bright and cheerful' },
        { label: '🟢 Green', value: '#00FF00', emoji: '🟢', description: 'Fresh and natural' },
        { label: '🔵 Blue', value: '#0088FF', emoji: '🔵', description: 'Calm and trustworthy' },
        { label: '🟣 Purple', value: '#9B59B6', emoji: '🟣', description: 'Royal and creative' },
        { label: '🟤 Brown', value: '#8B4513', emoji: '🟤', description: 'Earthy and stable' },
        { label: '⚫ Black', value: '#000000', emoji: '⚫', description: 'Mysterious and elegant' },
        { label: '⚪ White', value: '#FFFFFF', emoji: '⚪', description: 'Pure and clean' },
        { label: '🩷 Pink', value: '#FF69B4', emoji: '🩷', description: 'Cute and lovely' },
        { label: '💙 Cyan', value: '#00FFFF', emoji: '💙', description: 'Cool and modern' },
        { label: '💚 Lime', value: '#32CD32', emoji: '💚', description: 'Vibrant and fresh' },
        { label: '🧡 Deep Orange', value: '#FF4500', emoji: '🧡', description: 'Intense and fiery' },
        { label: '💜 Violet', value: '#8A2BE2', emoji: '💜', description: 'Magical and unique' },
        { label: '🩵 Sky Blue', value: '#87CEEB', emoji: '🩵', description: 'Light and airy' },
        { label: '💛 Gold', value: '#FFD700', emoji: '💛', description: 'Precious and valuable' },
        { label: '❤️ Crimson', value: '#DC143C', emoji: '❤️', description: 'Deep and passionate' },
        { label: '💖 Hot Pink', value: '#FF1493', emoji: '💖', description: 'Bold and fun' },
        { label: '🖤 Dark Gray', value: '#2F4F4F', emoji: '🖤', description: 'Sleek and sophisticated' },
        { label: '🤍 Light Gray', value: '#D3D3D3', emoji: '🤍', description: 'Neutral and soft' },
        { label: '🌈 Rainbow (Random)', value: 'RANDOM', emoji: '🌈', description: 'Surprise me!' }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`color_picker_${interaction.user.id}`)
        .setPlaceholder('🎨 Choose a color for your role!')
        .addOptions(
          colorOptions.map(color => 
            new StringSelectMenuOptionBuilder()
              .setLabel(color.label)
              .setValue(color.value)
              .setDescription(color.description)
              .setEmoji(color.emoji)
          )
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`show_color_list_createrole_${interaction.user.id}`)
            .setLabel('🎭 Display all colors list')
            .setStyle(ButtonStyle.Primary)
        );

      pendingRoles.set(interaction.user.id, { name: name, guildId: interaction.guild.id });

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 Choose Your Role Color!')
        .setDescription(`**Role Name:** ${name}\n\nSelect a beautiful color from the menu below!\nEach color comes with its own unique vibe! ✨`)
        .setFooter({ text: 'Click the menu to see all color options' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], components: [row, buttonRow] });
    }

    if (interaction.commandName === 'coloringrole') {
      const colorOptions = [
        { label: '🔴 Red', value: '#FF0000', emoji: '🔴', description: 'Bold and powerful' },
        { label: '🟠 Orange', value: '#FF8800', emoji: '🟠', description: 'Warm and energetic' },
        { label: '🟡 Yellow', value: '#FFFF00', emoji: '🟡', description: 'Bright and cheerful' },
        { label: '🟢 Green', value: '#00FF00', emoji: '🟢', description: 'Fresh and natural' },
        { label: '🔵 Blue', value: '#0088FF', emoji: '🔵', description: 'Calm and trustworthy' },
        { label: '🟣 Purple', value: '#9B59B6', emoji: '🟣', description: 'Royal and creative' },
        { label: '🟤 Brown', value: '#8B4513', emoji: '🟤', description: 'Earthy and stable' },
        { label: '⚫ Black', value: '#000000', emoji: '⚫', description: 'Mysterious and elegant' },
        { label: '⚪ White', value: '#FFFFFF', emoji: '⚪', description: 'Pure and clean' },
        { label: '🩷 Pink', value: '#FF69B4', emoji: '🩷', description: 'Cute and lovely' },
        { label: '💙 Cyan', value: '#00FFFF', emoji: '💙', description: 'Cool and modern' },
        { label: '💚 Lime', value: '#32CD32', emoji: '💚', description: 'Vibrant and fresh' },
        { label: '🧡 Deep Orange', value: '#FF4500', emoji: '🧡', description: 'Intense and fiery' },
        { label: '💜 Violet', value: '#8A2BE2', emoji: '💜', description: 'Magical and unique' },
        { label: '🩵 Sky Blue', value: '#87CEEB', emoji: '🩵', description: 'Light and airy' },
        { label: '💛 Gold', value: '#FFD700', emoji: '💛', description: 'Precious and valuable' },
        { label: '❤️ Crimson', value: '#DC143C', emoji: '❤️', description: 'Deep and passionate' },
        { label: '💖 Hot Pink', value: '#FF1493', emoji: '💖', description: 'Bold and fun' },
        { label: '🖤 Dark Gray', value: '#2F4F4F', emoji: '🖤', description: 'Sleek and sophisticated' },
        { label: '🤍 Light Gray', value: '#D3D3D3', emoji: '🤍', description: 'Neutral and soft' },
        { label: '🌈 Rainbow (Random)', value: 'RANDOM', emoji: '🌈', description: 'Surprise me!' }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`profile_color_picker_${interaction.user.id}`)
        .setPlaceholder('🎨 Choose your profile color!')
        .addOptions(
          colorOptions.map(color => 
            new StringSelectMenuOptionBuilder()
              .setLabel(color.label)
              .setValue(color.value)
              .setDescription(color.description)
              .setEmoji(color.emoji)
          )
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`show_color_list_${interaction.user.id}`)
            .setLabel('🎭 Display all colors list')
            .setStyle(ButtonStyle.Primary)
        );

      pendingRoles.set(interaction.user.id, { type: 'profile_color', guildId: interaction.guild.id });

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 Choose Your Profile Color!')
        .setDescription(`Select a beautiful color for your profile!\n\nThis will give you a personal color role.\nYour name will appear in this color! ✨`)
        .setFooter({ text: 'Change it anytime by running this command again!' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], components: [row, buttonRow], ephemeral: true });
    }

    if (interaction.commandName === 'rolemenu') {
      const allRoles = interaction.guild.roles.cache
        .filter(role => role.name !== '@everyone' && !role.managed)
        .sort((a, b) => b.position - a.position)
        .map(role => role);

      if (allRoles.length === 0) {
        await interaction.reply({ content: '❌ No roles available! Create some roles first with `/createrole` or `/setuproles`.', ephemeral: true });
        return;
      }

      const rolesToShow = allRoles.slice(0, 25);
      
      const roleList = rolesToShow.map(role => `${role.name}`).join('\n');
      
      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎭 Choose Your Roles!')
        .setDescription(`Click the buttons below to toggle roles!\n\n**Available Roles:**\n${roleList}`)
        .setFooter({ text: 'Click a button to add or remove a role!' })
        .setTimestamp();

      const rows = [];
      const buttonStyles = [ButtonStyle.Primary, ButtonStyle.Success, ButtonStyle.Danger, ButtonStyle.Secondary];
      
      for (let i = 0; i < rolesToShow.length; i += 5) {
        const row = new ActionRowBuilder();
        const roleSlice = rolesToShow.slice(i, i + 5);
        
        roleSlice.forEach((role, index) => {
          const button = new ButtonBuilder()
            .setCustomId(`role_${role.id}`)
            .setLabel(role.name.length > 80 ? role.name.substring(0, 77) + '...' : role.name)
            .setStyle(buttonStyles[index % buttonStyles.length]);
          row.addComponents(button);
        });
        
        rows.push(row);
      }

      await interaction.reply({ embeds: [embed], components: rows });
    }

    if (interaction.commandName === 'listroles') {
      const allRoles = interaction.guild.roles.cache
        .filter(role => role.name !== '@everyone')
        .sort((a, b) => b.position - a.position);
      
      const coloredRoles = allRoles.filter(r => r.color !== 0);
      const plainRoles = allRoles.filter(r => r.color === 0);
      
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎭 Server Roles Directory')
        .setDescription('```ansi\n[2;33m▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰[0m\n```\n✨ **Complete role hierarchy for this server**')
        .setTimestamp();
      
      if (coloredRoles.size > 0) {
        const coloredList = Array.from(coloredRoles.values())
          .slice(0, 15)
          .map(role => `<@&${role.id}> \`${role.hexColor}\` • ${role.members.size} members`)
          .join('\n');
        embed.addFields({ 
          name: '🌈 Colored Roles', 
          value: coloredList || 'None',
          inline: false 
        });
      }
      
      if (plainRoles.size > 0) {
        const plainList = Array.from(plainRoles.values())
          .slice(0, 10)
          .map(role => `<@&${role.id}> • ${role.members.size} members`)
          .join('\n');
        embed.addFields({ 
          name: '⚪ Standard Roles', 
          value: plainList || 'None',
          inline: false 
        });
      }

      embed.setFooter({ 
        text: `Total: ${allRoles.size} roles | ${coloredRoles.size} colored • ${plainRoles.size} standard`, 
        iconURL: interaction.guild.iconURL() 
      });

      await interaction.reply({ embeds: [embed] });
    }

    if (interaction.commandName === 'deleterole') {
      const roleName = interaction.options.getString('rolename');
      
      const loadingEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('🔍 Searching for Role...')
        .setDescription(`\`\`\`ansi\n[2;31m▰▰▰▱▱▱▱▱▱▱[0m 30%\n\`\`\`\n🎭 Looking for role: **${roleName}**...`)
        .setTimestamp();
      
      await interaction.reply({ embeds: [loadingEmbed] });
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const role = interaction.guild.roles.cache.find(r => r.name === roleName);
      
      if (!role) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Role Not Found!')
          .setDescription(`\`\`\`diff\n- ERROR: Role "${roleName}" does not exist in this server!\n\`\`\`\n💡 **Tip:** Role names are case-sensitive!`)
          .setFooter({ text: 'Use /listroles to see all available roles' })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [errorEmbed] });
        return;
      }
      
      const progressEmbed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('🗑️ Deleting Role...')
        .setDescription(`\`\`\`ansi\n[2;33m▰▰▰▰▰▰▰▱▱▱[0m 70%\n\`\`\`\n💥 Removing **${role.name}** from the server...`)
        .setTimestamp();
      
      await interaction.editReply({ embeds: [progressEmbed] });
      
      try {
        const roleColor = role.color;
        const memberCount = role.members.size;
        
        await role.delete(`Deleted by ${interaction.user.tag}`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const successEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('💥 Role Successfully Deleted!')
          .setDescription(`╔═══════════════════════════════╗\n║   **ROLE DELETION COMPLETE**   ║\n╚═══════════════════════════════╝\n\n🗑️ The role **${roleName}** has been permanently removed!\n\n✨ *Server updated!*`)
          .addFields(
            { name: '🎭 Deleted Role', value: roleName, inline: true },
            { name: '👥 Members Affected', value: `${memberCount}`, inline: true },
            { name: '⏰ Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
            { name: '📊 Progress', value: '```ansi\n[2;31m▰▰▰▰▰▰▰▰▰▰[0m 100%\n```', inline: false }
          )
          .setFooter({ text: `Deleted by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [successEmbed] });
      } catch (error) {
        const errorEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('❌ Role Deletion Failed!')
          .setDescription(`\`\`\`diff\n- ERROR: ${error.message}\n\`\`\`\n⚠️ **Possible reasons:**\n• The role is higher than the bot's highest role\n• Missing permissions\n• The role is managed by an integration`)
          .setTimestamp();
        
        await interaction.editReply({ embeds: [errorEmbed] });
      }
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId.startsWith('color_picker_')) {
      const userId = interaction.customId.split('_')[2];
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This color picker is not for you!', flags: 64 });
        return;
      }

      const roleData = pendingRoles.get(interaction.user.id);
      if (!roleData) {
        await interaction.reply({ content: '❌ Role creation session expired. Please try again!', flags: 64 });
        return;
      }

      let selectedColor = interaction.values[0];
      
      if (selectedColor === 'RANDOM') {
        const randomColors = ['#FF0000', '#FF8800', '#FFD700', '#00FF00', '#0088FF', '#9B59B6', '#FF69B4', '#00FFFF', '#FF1493', '#32CD32'];
        selectedColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      }

      try {
        const guild = await client.guilds.fetch(roleData.guildId);
        const role = await guild.roles.create({
          name: roleData.name,
          color: selectedColor,
          reason: `Created by ${interaction.user.tag}`
        });

        const embed = new EmbedBuilder()
          .setColor(selectedColor)
          .setTitle('✨ Role Created Successfully!')
          .setDescription(`Your new colorful role is ready!`)
          .addFields(
            { name: '🎭 Role Name', value: `<@&${role.id}>`, inline: true },
            { name: '🎨 Color', value: selectedColor, inline: true }
          )
          .setFooter({ text: 'Enjoy your new role!' })
          .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });
        pendingRoles.delete(interaction.user.id);
      } catch (error) {
        await interaction.update({ 
          content: `❌ Failed to create role: ${error.message}`, 
          embeds: [], 
          components: [] 
        });
        pendingRoles.delete(interaction.user.id);
      }
    }

    if (interaction.customId.startsWith('profile_color_picker_')) {
      const userId = interaction.customId.split('_')[3];
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This color picker is not for you!', ephemeral: true });
        return;
      }

      const roleData = pendingRoles.get(interaction.user.id);
      if (!roleData || roleData.type !== 'profile_color') {
        await interaction.reply({ content: '❌ Session expired. Please try again!', ephemeral: true });
        return;
      }

      let selectedColor = interaction.values[0];
      
      const colorNames = {
        '#FF0000': 'Red',
        '#FF8800': 'Orange',
        '#FFFF00': 'Yellow',
        '#00FF00': 'Green',
        '#0088FF': 'Blue',
        '#9B59B6': 'Purple',
        '#8B4513': 'Brown',
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#FF69B4': 'Pink',
        '#00FFFF': 'Cyan',
        '#32CD32': 'Lime',
        '#FF4500': 'Deep Orange',
        '#8A2BE2': 'Violet',
        '#87CEEB': 'Sky Blue',
        '#FFD700': 'Gold',
        '#DC143C': 'Crimson',
        '#FF1493': 'Hot Pink',
        '#2F4F4F': 'Dark Gray',
        '#D3D3D3': 'Light Gray'
      };
      
      const colorEmojis = {
        '#FF0000': '🔥',
        '#FF8800': '🍊',
        '#FFFF00': '☀️',
        '#00FF00': '🌿',
        '#0088FF': '🌊',
        '#9B59B6': '👾',
        '#8B4513': '🍂',
        '#000000': '🌑',
        '#FFFFFF': '☁️',
        '#FF69B4': '🌸',
        '#00FFFF': '💎',
        '#32CD32': '🍃',
        '#FF4500': '🎃',
        '#8A2BE2': '🔮',
        '#87CEEB': '🦋',
        '#FFD700': '🏆',
        '#DC143C': '🌹',
        '#FF1493': '💗',
        '#2F4F4F': '🗿',
        '#D3D3D3': '🥈'
      };
      
      if (selectedColor === 'RANDOM') {
        const randomColors = ['#FF0000', '#FF8800', '#FFD700', '#00FF00', '#0088FF', '#9B59B6', '#FF69B4', '#00FFFF', '#FF1493', '#32CD32'];
        selectedColor = randomColors[Math.floor(Math.random() * randomColors.length)];
      }
      
      const colorName = colorNames[selectedColor] || 'Color';
      const colorEmoji = colorEmojis[selectedColor] || '🎨';

      try {
        const guild = await client.guilds.fetch(roleData.guildId);
        const member = await guild.members.fetch(interaction.user.id);
        
        const allColorNames = Object.values(colorNames);
        const allColorEmojis = Object.values(colorEmojis);
        let oldPersonalRole = guild.roles.cache.find(r => {
          const hasColorName = allColorNames.some(name => r.name.includes(name));
          const hasColorEmoji = allColorEmojis.some(emoji => r.name.includes(emoji));
          return (hasColorName || hasColorEmoji) && member.roles.cache.has(r.id);
        });
        
        if (oldPersonalRole) {
          await member.roles.remove(oldPersonalRole);
          await oldPersonalRole.delete(`Removing old color role for ${interaction.user.tag}`);
        }
        
        const personalRoleName = `${colorEmoji} ${colorName} ${colorEmoji}`;
        const personalRole = await guild.roles.create({
          name: personalRoleName,
          color: selectedColor,
          reason: `Profile color for ${interaction.user.tag}`
        });
        
        const botMember = await guild.members.fetch(client.user.id);
        const botHighestRole = botMember.roles.highest;
        
        try {
          await personalRole.setPosition(botHighestRole.position - 1);
        } catch (posError) {
          console.log('Could not set role position, but role was created:', posError.message);
        }
        
        await member.roles.add(personalRole);

        const embed = new EmbedBuilder()
          .setColor(selectedColor)
          .setTitle('✨ Profile Color Updated!')
          .setDescription(`Your profile color has been set to **${colorEmoji} ${colorName} ${colorEmoji}**!\n\nYour name will now appear in this beautiful color! 🎨\n\n💡 Run this command again anytime to change your color!`)
          .addFields(
            { name: '🎨 Color', value: `${colorEmoji} ${colorName} ${colorEmoji}`, inline: true },
            { name: '🎭 Your Color Role', value: `<@&${personalRole.id}>`, inline: true }
          )
          .setFooter({ text: 'This is your personal color - only for you!' })
          .setTimestamp();

        await interaction.update({ embeds: [embed], components: [] });
        pendingRoles.delete(interaction.user.id);
      } catch (error) {
        await interaction.update({ 
          content: `❌ Failed to set profile color: ${error.message}`, 
          embeds: [], 
          components: [] 
        });
        pendingRoles.delete(interaction.user.id);
      }
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'celebrate_role') {
      const celebrationEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🎊🎉 CELEBRATION TIME! 🎉🎊')
        .setDescription('```\n' +
          '    ✨        ✨        ✨\n' +
          '  🎊  🎉  🎊  🎉  🎊  🎉\n' +
          '    ⭐  🌟  ⭐  🌟  ⭐\n' +
          '  🎈  🎁  🎈  🎁  🎈  🎁\n' +
          '    ✨        ✨        ✨\n' +
          '```\n**WOOHOO! New role powers activated!** 🚀\n\n🌈 *Spreading joy and celebration!* 🌈')
        .setFooter({ text: 'Keep being awesome! 💫' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [celebrationEmbed], flags: 64 });
      return;
    }
    
    if (interaction.customId === 'quick_setup_guide') {
      const setupEmbed = new EmbedBuilder()
        .setColor('#00D9FF')
        .setTitle('🎨 Quick Setup Guide')
        .setDescription('```ansi\n[2;36m▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰[0m\n```\n✨ **Get started in 3 easy steps!**')
        .addFields(
          { 
            name: '**Step 1: Create Roles** 🎭', 
            value: '```yaml\n• Use /setuproles for instant 10 beautiful roles\n• Or /createrole for custom colored roles\n```',
            inline: false 
          },
          { 
            name: '**Step 2: Set Up Role Menu** 🎯', 
            value: '```yaml\n• Run /rolemenu to create interactive role picker\n• Users can click buttons to self-assign roles\n```',
            inline: false 
          },
          { 
            name: '**Step 3: Manage & Customize** ⚙️', 
            value: '```yaml\n• Use /giverole and /removerole for manual control\n• Check /listroles to see all your roles\n• Use /stats to monitor server analytics\n```',
            inline: false 
          }
        )
        .setFooter({ text: '💡 Pro tip: Let users pick their own colors with /coloringrole!' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [setupEmbed], ephemeral: true });
      return;
    }
    
    if (interaction.customId === 'tips_tricks') {
      const tipsEmbed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('💡 Tips & Tricks')
        .setDescription('```ansi\n[2;33m▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰[0m\n```\n✨ **Master tips for role management!**')
        .addFields(
          { 
            name: '🎨 Color Coordination', 
            value: '• Organize roles by color for visual hierarchy\n• Use similar colors for related role groups\n• Bright colors stand out more in user lists',
            inline: false 
          },
          { 
            name: '📊 Role Organization', 
            value: '• Higher positioned roles appear first\n• Keep important roles at the top\n• Use emojis in role names for flair',
            inline: false 
          },
          { 
            name: '⚡ Quick Actions', 
            value: '• Role menus reduce admin workload\n• Personal color roles boost engagement\n• Regular role audits keep server clean',
            inline: false 
          },
          { 
            name: '🔒 Permission Pro Tips', 
            value: '• Bot role must be higher than roles it manages\n• Check role hierarchy before bulk changes\n• Test permissions in a safe channel first',
            inline: false 
          }
        )
        .setFooter({ text: '🌟 Keep experimenting to find what works for your community!' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [tipsEmbed], ephemeral: true });
      return;
    }
    
    if (interaction.customId.startsWith('show_color_list_createrole_')) {
      const parts = interaction.customId.split('_');
      const userId = parts[parts.length - 1];
      
      console.log('Button ID:', interaction.customId);
      console.log('Extracted userId:', userId);
      console.log('Actual user.id:', interaction.user.id);
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This button is not for you!', flags: 64 });
        return;
      }

      const colorsList = `
🔥 **Red** - Fire, passion, energy
🍊 **Orange** - Warmth, creativity, freshness
☀️ **Yellow** - Sunshine, happiness, joy
🌿 **Green** - Nature, growth, life
🌊 **Blue** - Ocean, calm, depth
👾 **Purple** - Gaming vibes
🍂 **Brown** - Autumn, earthiness, stability
🌑 **Black** - Night, mystery, elegance
☁️ **White** - Clouds, purity, peace
🌸 **Pink** - Cherry blossom, beauty, sweetness
💎 **Cyan** - Diamond, clarity, value
🍃 **Lime** - Fresh leaves, vitality
🎃 **Deep Orange** - Halloween festive
🔮 **Violet** - Magic, mystery, spirituality
🦋 **Sky Blue** - Butterfly, freedom, transformation
🏆 **Gold** - Trophy, victory, achievement
🌹 **Crimson** - Rose, romance, passion
💗 **Hot Pink** - Heart, love, affection
🗿 **Dark Gray** - Stone, strength, solidity
🥈 **Light Gray** - Silver medal
      `;

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 All Available Colors')
        .setDescription(colorsList)
        .setFooter({ text: 'Click Back to choose your color!' })
        .setTimestamp();

      const backButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`back_to_color_picker_createrole_${interaction.user.id}`)
            .setLabel('🔙 Back')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.update({ embeds: [embed], components: [backButton] });
      return;
    }
    
    if (interaction.customId.startsWith('show_color_list_') && !interaction.customId.startsWith('show_color_list_createrole_')) {
      const userId = interaction.customId.split('_')[3];
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This button is not for you!', flags: 64 });
        return;
      }

      const colorsList = `
🔥 **Red** - Fire, passion, energy
🍊 **Orange** - Warmth, creativity, freshness
☀️ **Yellow** - Sunshine, happiness, joy
🌿 **Green** - Nature, growth, life
🌊 **Blue** - Ocean, calm, depth
👾 **Purple** - Gaming vibes
🍂 **Brown** - Autumn, earthiness, stability
🌑 **Black** - Night, mystery, elegance
☁️ **White** - Clouds, purity, peace
🌸 **Pink** - Cherry blossom, beauty, sweetness
💎 **Cyan** - Diamond, clarity, value
🍃 **Lime** - Fresh leaves, vitality
🎃 **Deep Orange** - Halloween festive
🔮 **Violet** - Magic, mystery, spirituality
🦋 **Sky Blue** - Butterfly, freedom, transformation
🏆 **Gold** - Trophy, victory, achievement
🌹 **Crimson** - Rose, romance, passion
💗 **Hot Pink** - Heart, love, affection
🗿 **Dark Gray** - Stone, strength, solidity
🥈 **Light Gray** - Silver medal
      `;

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 All Available Colors')
        .setDescription(colorsList)
        .setFooter({ text: 'Click Back to choose your color!' })
        .setTimestamp();

      const backButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`back_to_color_picker_${interaction.user.id}`)
            .setLabel('🔙 Back')
            .setStyle(ButtonStyle.Secondary)
        );

      await interaction.update({ embeds: [embed], components: [backButton] });
      return;
    }

    if (interaction.customId.startsWith('back_to_color_picker_createrole_')) {
      const parts = interaction.customId.split('_');
      const userId = parts[parts.length - 1];
      
      console.log('Back button ID:', interaction.customId);
      console.log('Extracted userId:', userId);
      console.log('Actual user.id:', interaction.user.id);
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This button is not for you!', flags: 64 });
        return;
      }

      const roleData = pendingRoles.get(interaction.user.id);
      if (!roleData || !roleData.name) {
        await interaction.reply({ content: '❌ Session expired. Please run /createrole again!', flags: 64 });
        return;
      }

      const colorOptions = [
        { label: '🔴 Red', value: '#FF0000', emoji: '🔴', description: 'Bold and powerful' },
        { label: '🟠 Orange', value: '#FF8800', emoji: '🟠', description: 'Warm and energetic' },
        { label: '🟡 Yellow', value: '#FFFF00', emoji: '🟡', description: 'Bright and cheerful' },
        { label: '🟢 Green', value: '#00FF00', emoji: '🟢', description: 'Fresh and natural' },
        { label: '🔵 Blue', value: '#0088FF', emoji: '🔵', description: 'Calm and trustworthy' },
        { label: '🟣 Purple', value: '#9B59B6', emoji: '🟣', description: 'Royal and creative' },
        { label: '🟤 Brown', value: '#8B4513', emoji: '🟤', description: 'Earthy and stable' },
        { label: '⚫ Black', value: '#000000', emoji: '⚫', description: 'Mysterious and elegant' },
        { label: '⚪ White', value: '#FFFFFF', emoji: '⚪', description: 'Pure and clean' },
        { label: '🩷 Pink', value: '#FF69B4', emoji: '🩷', description: 'Cute and lovely' },
        { label: '💙 Cyan', value: '#00FFFF', emoji: '💙', description: 'Cool and modern' },
        { label: '💚 Lime', value: '#32CD32', emoji: '💚', description: 'Vibrant and fresh' },
        { label: '🧡 Deep Orange', value: '#FF4500', emoji: '🧡', description: 'Intense and fiery' },
        { label: '💜 Violet', value: '#8A2BE2', emoji: '💜', description: 'Magical and unique' },
        { label: '🩵 Sky Blue', value: '#87CEEB', emoji: '🩵', description: 'Light and airy' },
        { label: '💛 Gold', value: '#FFD700', emoji: '💛', description: 'Precious and valuable' },
        { label: '❤️ Crimson', value: '#DC143C', emoji: '❤️', description: 'Deep and passionate' },
        { label: '💖 Hot Pink', value: '#FF1493', emoji: '💖', description: 'Bold and fun' },
        { label: '🖤 Dark Gray', value: '#2F4F4F', emoji: '🖤', description: 'Sleek and sophisticated' },
        { label: '🤍 Light Gray', value: '#D3D3D3', emoji: '🤍', description: 'Neutral and soft' },
        { label: '🌈 Rainbow (Random)', value: 'RANDOM', emoji: '🌈', description: 'Surprise me!' }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`color_picker_${interaction.user.id}`)
        .setPlaceholder('🎨 Choose a color for your role!')
        .addOptions(
          colorOptions.map(color => 
            new StringSelectMenuOptionBuilder()
              .setLabel(color.label)
              .setValue(color.value)
              .setDescription(color.description)
              .setEmoji(color.emoji)
          )
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`show_color_list_createrole_${interaction.user.id}`)
            .setLabel('🎭 Display all colors list')
            .setStyle(ButtonStyle.Primary)
        );

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 Choose Your Role Color!')
        .setDescription(`**Role Name:** ${roleData.name}\n\nSelect a beautiful color from the menu below!\nEach color comes with its own unique vibe! ✨`)
        .setFooter({ text: 'Click the menu to see all color options' })
        .setTimestamp();

      await interaction.update({ embeds: [embed], components: [row, buttonRow] });
      return;
    }

    if (interaction.customId.startsWith('back_to_color_picker_') && !interaction.customId.startsWith('back_to_color_picker_createrole_')) {
      const userId = interaction.customId.split('_')[4];
      
      if (userId !== interaction.user.id) {
        await interaction.reply({ content: '❌ This button is not for you!', flags: 64 });
        return;
      }

      const colorOptions = [
        { label: '🔴 Red', value: '#FF0000', emoji: '🔴', description: 'Bold and powerful' },
        { label: '🟠 Orange', value: '#FF8800', emoji: '🟠', description: 'Warm and energetic' },
        { label: '🟡 Yellow', value: '#FFFF00', emoji: '🟡', description: 'Bright and cheerful' },
        { label: '🟢 Green', value: '#00FF00', emoji: '🟢', description: 'Fresh and natural' },
        { label: '🔵 Blue', value: '#0088FF', emoji: '🔵', description: 'Calm and trustworthy' },
        { label: '🟣 Purple', value: '#9B59B6', emoji: '🟣', description: 'Royal and creative' },
        { label: '🟤 Brown', value: '#8B4513', emoji: '🟤', description: 'Earthy and stable' },
        { label: '⚫ Black', value: '#000000', emoji: '⚫', description: 'Mysterious and elegant' },
        { label: '⚪ White', value: '#FFFFFF', emoji: '⚪', description: 'Pure and clean' },
        { label: '🩷 Pink', value: '#FF69B4', emoji: '🩷', description: 'Cute and lovely' },
        { label: '💙 Cyan', value: '#00FFFF', emoji: '💙', description: 'Cool and modern' },
        { label: '💚 Lime', value: '#32CD32', emoji: '💚', description: 'Vibrant and fresh' },
        { label: '🧡 Deep Orange', value: '#FF4500', emoji: '🧡', description: 'Intense and fiery' },
        { label: '💜 Violet', value: '#8A2BE2', emoji: '💜', description: 'Magical and unique' },
        { label: '🩵 Sky Blue', value: '#87CEEB', emoji: '🩵', description: 'Light and airy' },
        { label: '💛 Gold', value: '#FFD700', emoji: '💛', description: 'Precious and valuable' },
        { label: '❤️ Crimson', value: '#DC143C', emoji: '❤️', description: 'Deep and passionate' },
        { label: '💖 Hot Pink', value: '#FF1493', emoji: '💖', description: 'Bold and fun' },
        { label: '🖤 Dark Gray', value: '#2F4F4F', emoji: '🖤', description: 'Sleek and sophisticated' },
        { label: '🤍 Light Gray', value: '#D3D3D3', emoji: '🤍', description: 'Neutral and soft' },
        { label: '🌈 Rainbow (Random)', value: 'RANDOM', emoji: '🌈', description: 'Surprise me!' }
      ];

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(`profile_color_picker_${interaction.user.id}`)
        .setPlaceholder('🎨 Choose your profile color!')
        .addOptions(
          colorOptions.map(color => 
            new StringSelectMenuOptionBuilder()
              .setLabel(color.label)
              .setValue(color.value)
              .setDescription(color.description)
              .setEmoji(color.emoji)
          )
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);
      
      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`show_color_list_${interaction.user.id}`)
            .setLabel('🎭 Display all colors list')
            .setStyle(ButtonStyle.Primary)
        );

      const embed = new EmbedBuilder()
        .setColor('#FF00FF')
        .setTitle('🎨 Choose Your Profile Color!')
        .setDescription(`Select a beautiful color for your profile!\n\nThis will give you a personal color role.\nYour name will appear in this color! ✨`)
        .setFooter({ text: 'Change it anytime by running this command again!' })
        .setTimestamp();

      await interaction.update({ embeds: [embed], components: [row, buttonRow] });
      return;
    }
    
    if (interaction.customId.startsWith('role_')) {
      const roleId = interaction.customId.replace('role_', '');
      const role = interaction.guild.roles.cache.get(roleId);
      
      if (!role) {
        await interaction.reply({ content: `❌ Role not found! It may have been deleted.`, flags: 64 });
        return;
      }

      const member = interaction.member;
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        await interaction.reply({ content: `🗑️ Removed role **${role.name}**!`, flags: 64 });
      } else {
        await member.roles.add(role);
        await interaction.reply({ content: `✨ You now have the **${role.name}** role!`, flags: 64 });
      }
    }
  }
  } catch (error) {
    console.error('Error handling interaction:', error);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ An error occurred while processing your request!', ephemeral: true });
      } else {
        await interaction.followUp({ content: '❌ An error occurred while processing your request!', ephemeral: true });
      }
    } catch (followUpError) {
      console.error('Error sending error message:', followUpError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check bot status and performance'),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display the complete command guide with tips and tricks'),
  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View detailed server and bot statistics'),
  new SlashCommandBuilder()
    .setName('giverole')
    .setDescription('Give a role to a user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to give the role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder()
    .setName('removerole')
    .setDescription('Remove a role from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to remove the role from')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to remove')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder()
    .setName('setuproles')
    .setDescription('Create a set of beautiful colorful roles for your server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder()
    .setName('createrole')
    .setDescription('Create a custom colored role with a visual color picker')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('The name of the role')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder()
    .setName('rolemenu')
    .setDescription('Display an interactive menu to pick roles'),
  new SlashCommandBuilder()
    .setName('listroles')
    .setDescription('List all roles in the server'),
  new SlashCommandBuilder()
    .setName('deleterole')
    .setDescription('Delete a role from the server by name')
    .addStringOption(option =>
      option.setName('rolename')
        .setDescription('The exact name of the role to delete')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  new SlashCommandBuilder()
    .setName('coloringrole')
    .setDescription('Set your own profile color (personal color role)')
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('✨ All slash commands registered successfully!');
  } catch (error) {
    console.error(error);
  }
})();
