exports.getChannelName = (channels,channelId) => {
  const channel = channels.get(channelId);

  if (channel)
    return exports.cutName(channel.name);
  else
    return 'Deleted [' + channelId + ']';
}

exports.getChannelType = (channels,channelId) => {
  const channel = channels.get(channelId);

  if (channel)
    return channel.type;
  else
    return null;
}

exports.getRoleName = (roles,roleId) => {
  const role = roles.get(roleId);

  if (role)
    return exports.cutName(role.name);
  else
    return 'Deleted [' + roleId + ']\n';
}

exports.getChannelTypeIcon = (channels,channelId) => {
  const channel = channels.get(channelId);

  if (!channel)
    return ':grey_question:';

  if (channel.type == 'voice')
    return ':microphone2:';
  else
    return ':writing_hand:';
}

exports.getGuildMemberNames = (guild,userIds) => {
  return new Promise(async function (resolve, reject) {
    try {
      let userId,member,userIdsToFetch = [],userNames = {};

      // Add cached
      for (userId of userIds) {
        member = guild.members.cache.get(userId);
        if (member)
          userNames[userId] = exports.getGuildMemberAlias(member);
        else
          userIdsToFetch.push(userId);
      }

      // Add fetched
      if (userIdsToFetch.length > 0) {
        const fetchedMembers = await guild.members.fetch({user: userIdsToFetch, withPresences:false, cache: false});// #discordapi
        for (let fetchedMember of fetchedMembers)
          userNames[userId] = exports.getGuildMemberAlias(fetchedMember[1]);
      }

      // Add deleted
      for (userId of userIds) {
        if (!userNames[userId])
          userNames[userId] = 'User left [' + userId + ']';
      }

      resolve(userNames);
    } catch (e) { console.log(e); }
  });
}

exports.getGuildMemberName = (guild,userId) => {
  return new Promise(async function (resolve, reject) {
    try {
      const guildMemberName = (await exports.getGuildMemberNames(guild,[userId]))[userId];
      resolve(guildMemberName);
    } catch (e) { console.log(e); }
  });
}

exports.addGuildMemberNamesToRanks = (guild,memberRanks) => {
  return new Promise(async function (resolve, reject) {
    try {
      let userIds = [],memberRank;
      for (memberRank of memberRanks) userIds.push(memberRank.userId);
      const userNames = await exports.getGuildMemberNames(guild,userIds);

      for (memberRank of memberRanks)
        memberRank.name = userNames[memberRank.userId];

      resolve();
    } catch (e) { console.log(e); }
  });
}

exports.getGuildMemberAlias = (member) => {
  if (member.guild.appData.showNicknames) {
    if (member.nickname)
      return exports.cutName(member.nickname);
    else
      return exports.cutName(member.user.username);
  } else
    return exports.cutName(member.user.username);
}

exports.cutName = (name) => {
  if (name.length > 32)
    name = name.substr(0,32) + '..';

  return name;
}

/* exports.getSimpleEmbed = (title,text) => {
  const embed = new Discord.MessageEmbed();
  embed.setColor(0x00AE86);

  if (title != '')
    embed.setAuthor(title);

  if (text != '')
    embed.setDescription(text);

  return embed;

} */
