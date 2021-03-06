const resetModel = require('../models/resetModel.js');
const guildMemberModel = require('../models/guild/guildMemberModel.js');
const fct = require('../../util/fct.js');
let jobIndex = 0,sleepTime,batchsize;

if (process.env.NODE_ENV == 'production') {
  sleepTime = 3000;
  batchsize = 10000;
} else {
  sleepTime = 3000;
  batchsize = 3;
}

exports.start = async () => {
  let hrstart,hrend,resetJob,keys;

  while (true) {
    resetJob = null;
    try {
      keys = Object.keys(resetModel.resetJobs);

      if (keys.length > 0) {
        if (jobIndex >= keys.length)
          jobIndex = 0;

        resetJob = resetModel.resetJobs[keys[jobIndex]];
        hrstart = process.hrtime();
        await doResetJob(resetModel.resetJobs[keys[jobIndex]]);
        hrend = process.hrtime(hrstart);
        jobIndex++;
        console.log('doResetJob ' + resetJob.type  + ' for ' + resetJob.cmdChannel.guild.id + ' finished after ' + hrend[0]  + 's.');
      }
    } catch (e) { console.log(e); }

    try {
      await fct.sleep(sleepTime);
    } catch (e) { console.log(e); return; }
  }
}

const doResetJob = (resetJob) => {
  return new Promise(async function (resolve, reject) {
    try {
      let count = 0;
      if (!resetJob || !resetJob.cmdChannel || !resetJob.cmdChannel.guild) {
        resetModel.resetJobs = {};
        return reject('Resetjob cache properties undefined.');
      }

      if (resetJob.type == 'all')
        count = await resetModel.storage.resetGuildAll(batchsize,resetJob.cmdChannel.guild);
      else if (resetJob.type == 'settings')
        count = await resetModel.storage.resetGuildSettings(batchsize,resetJob.cmdChannel.guild);
      else if (resetJob.type == 'stats')
        count = await resetModel.storage.resetGuildStats(batchsize,resetJob.cmdChannel.guild);
      else if (resetJob.type == 'guildMembers' && resetJob.userIds.length > 0)
        count = await resetModel.storage.resetGuildMembers(batchsize,resetJob.cmdChannel.guild,resetJob.userIds);
      else if (resetJob.type == 'guildChannels' && resetJob.channelIds.length > 0)
        count = await resetModel.storage.resetGuildChannels(batchsize,resetJob.cmdChannel.guild,resetJob.channelIds);

      await resetJob.cmdChannel.send('Reset ' + count + ' rows...');
      if (count < batchsize) {
        await resetJob.cmdChannel.send('Finished reset.');
        delete resetModel.resetJobs[resetJob.cmdChannel.guild.id];
      }

      resolve();
    } catch (e) {
      resetModel.resetJobs = {};
      reject(e);
    }
  });
}
