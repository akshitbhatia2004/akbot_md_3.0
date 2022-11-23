/* Copyright (C) 2022 Sourav KL11.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Raganork MD - Sourav KL11
*/
const {
    Module
} = require('../main');
const {
    Mimetype
} = require('@adiwajshing/baileys');
const fs = require('fs');
const got = require("got");
const axios = require('axios');
const setting = require('../config');
const {
    getPost,
    getStalk,
    getStory,
    skbuffer
} = require('raganork-bot');
const {
    downloadGram,
    pin,
    story,
    tiktok,
    fb
} = require('./misc/misc');
const Config = require('../config');
const s = require('../config');
var need = "*_Need instagram link!_*";
var downloading = "_*Downloading*_";
var need_acc = "*_Need an instagram username!_*";
var fail = "*_Download failed! Check your link and try again_*";
var need_acc_s = "_Need an instagram username or link!_";
let sourav = setting.MODE == 'public' ? false : true
let hnd = setting.HANDLERS !== 'false'? setting.HANDLERS.split("")[0]:"";
Module({
    pattern: 'insta ?(.*)',
    fromMe: sourav,
    desc: 'Instagram post/reel/tv/highlights downloader',
    usage: 'insta link or reply to a link',
    use: 'download'
}, (async (msg, query) => {
     var q = query[1] || msg.reply_message?.text
     if (q && (q.startsWith('l') || q.includes('youtu'))) return;
    if (!q) return await msg.sendReply("*Need instagram link*")
    if (q.includes("stories")) return await msg.sendReply("*_Use .story command!_*")
    if (q && !q.includes('instagram.com')) return await msg.client.sendMessage(msg.jid, {
        text: need
    }, {
        quoted: msg.data
    })
    var getid = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com(?:\/.+?)?\/(p|s|reel|tv)\/)([\w-]+)(?:\/)?(\?.*)?$/
    var url = getid.exec(q)
    if (url != null) {
        try { var res = await downloadGram(url[0]) } catch { return await msg.sendReply("_Something went wrong, Please try again!_") }
        if (res == false) return await msg.sendReply("*Download failed*");
        var quoted = msg.reply_message ? msg.quoted : msg.data
        for (var i in res) {
        await msg.client.sendMessage(msg.jid,{[res[i].includes("mp4")?'video':'image']:{url:res[i]}},{quoted})
        };
    }
}));
Module({
    pattern: 'fb ?(.*)',
    fromMe: sourav,
    desc: 'Facebook video downloader',
    usage: 'fb link or reply to a link',
    use: 'download'
}, (async (msg, query) => {
     var q = !msg.reply_message.message ? query[1] : msg.reply_message.message
     let _q = !msg.reply_message.message ? query[1] : msg.reply_message.message
     if (/\bhttps?:\/\/\S+/gi.test(q)) q = q.match(/\bhttps?:\/\/\S+/gi)[0]
     if (!q) return await msg.sendReply("*Need Facebook link*")
     if (!_q.includes("!")){
const buttons = [
  {buttonId: hnd+'fb '+q+' !hd', buttonText: {displayText: 'HD'}, type: 1},
  {buttonId: hnd+'fb '+q+' !sd', buttonText: {displayText: 'SD'}, type: 1}
 ]
const buttonMessage = {
    text: "*Select video quality*",
    footer: '',
    buttons: buttons,
    headerType: 1
}
 await msg.client.sendMessage(msg.jid, buttonMessage,{quoted:msg.data})
     }
    if (_q.includes("!")){
     var res = await fb(q);
     return await msg.sendReply({url: res[_q.split("!")[1]]},"video")
     }
        }));
Module({
    pattern: 'ig ?(.*)',
    fromMe: sourav,
    desc: 'Gets account info from instagram',
    usage: 'ig username',
    use: 'search'
}, (async (msg, query) => {
    if (query[1] === 'dl') return; 
    if (query[1] === '') return await msg.client.sendMessage(msg.jid, {
        text: need_acc
    }, {
        quoted: msg.data
    })
    var res = await getStalk(query[1])
    if (res === "false") return await msg.client.sendMessage(msg.jid, {
        text: "*_Username invalid!_*"
    }, {
        quoted: msg.data
    })
    var buffer = await skbuffer(res.hd_profile_pic_url_info.url)
    await msg.client.sendMessage(msg.jid, {
        image: buffer,
        caption: '_*Name:*_ ' + `${res.fullname}` + '\n _*Bio:*_ ' + `${res.biography}` + '\n _*Private account:*_ ' + `${res.is_private} ` + '\n _*Followers:*_ ' + `${res.followers}` + '\n _*Following:*_ ' + `${res.following}` + '\n _*Posts:*_ ' + `${res.post_count}` + '\n _*Verified:*_ ' + `${res.is_verified} ` + '\n _*IGTV videos:*_ ' + `${res.total_igtv_videos}`
    }, {
        quoted: msg.data
    });
}));
Module({
    pattern: 'story ?(.*)',
    fromMe: sourav,
    desc: 'Instagram stories downloader',
    usage: '.story username or link',
    use: 'download'
}, (async (msg, query) => {
    var user = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (user && user.includes("/reel/") || user.includes("/tv/") || user.includes("/p/")) return;
    if (!user) return await msg.sendReply(need_acc_s);
    user = !/\bhttps?:\/\/\S+/gi.test(user) ? `https://instagram.com/stories/${user}/` : user.match(/\bhttps?:\/\/\S+/gi)[0]
     try { var res = await downloadGram(user) } catch {return await msg.sendReply("*_Sorry, server error_*")}
    if (!res) return await msg.sendReply("*_User has no stories!_*")
    var StoryData = [];
    if (res.length<3){
    for (var i in res){
    await msg.sendReply({url: res[i]},res[i].includes("mp4")?"video":"image")
    }
    }
    else {
    for (var i in res){
    StoryData.push({
      title: "Story "+Math.floor(parseInt(i)+1),
      description: res[i].includes("mp4")?"Video":"Photo",
      rowId: `${hnd}upload ${res[i]}`
  })
  }
  const sections = [{
      title: "Click and send to download.",
      rows: StoryData
  }];
  const listMessage = {
      text: " ",
      footer: "_Total stories: " + res.length+"_",
      title: "_Download your stories_",
      buttonText: "View all",
      sections
  }
  await msg.client.sendMessage(msg.jid, listMessage)
}
}));
Module({
    pattern: 'pin ?(.*)',
    fromMe: sourav,
    desc: 'Pinterest downloader',
    usage: '.pin reply or link',
    use: 'download'
}, (async (msg, query) => {
    var user = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (user === 'g') return;
    if (!user) return await msg.sendReply("*Need url*");
    if (/\bhttps?:\/\/\S+/gi.test(user)) user = user.match(/\bhttps?:\/\/\S+/gi)[0]
    try { var res = await pin(user) } catch {return await msg.sendReply("*Server error*")}
    await msg.sendMessage('_Downloading ' + res.data.length + ' medias_');
    var quoted = msg.reply_message ? msg.quoted : msg.data
    for (var i of res.data){
        var type = i.url.includes("mp4") ? "video" : "image"
        await msg.client.sendMessage(msg.jid,{[type]:{url:i.url }},{quoted})
    }
}));
Module({
    pattern: 'tiktok ?(.*)',
    fromMe: sourav,
    desc: 'tiktok downloader',
    usage: '.tiktok reply or link',
    use: 'download'
}, (async (msg, query) => {
    var link = query[1] !== '' ? query[1] : msg.reply_message.text;
    if (!link) return await msg.sendReply("*Need a tiktok url*");
    link = link.match(/\bhttps?:\/\/\S+/gi)[0]
    try { var res = await tiktok(link) } catch {return await msg.sendReply("*Server error*")}
    var buttons = [{
        quickReplyButton: {
            displayText: 'No WM',
            id: 'tktk nowm '+msg.myjid+' '+res.nowm
        }
    }, {
        quickReplyButton: {
            displayText: 'With WM',
            id: 'tktk wm '+msg.myjid+' '+res.wm
        }  
    }]
    await msg.sendImageTemplate(await skbuffer("https://d15shllkswkct0.cloudfront.net/wp-content/blogs.dir/1/files/2018/10/tiktok.jpeg"),"*TikTok video downloader*","Choose your format:",buttons);
    }));
    Module({
        on: 'button',
        fromMe: sourav
    }, (async (msg) => {
        if (msg.list && msg.list.startsWith("igs") && msg.list.split(" ").includes(msg.myjid)){
            var username = msg.list.split(" ")[2];
            var count = parseInt(msg.list.split(" ")[3]);
            try { var res = await story(username) } catch {return await msg.sendReply("*Sorry, server error*")}
            return await msg.sendReply({url: res[count].url},res[count].type)
        }
        if (msg.button && msg.button.startsWith("tktk") && msg.button.includes(msg.myjid)){
        if (msg.button.includes("nowm")){
        return await msg.sendReply({url: msg.button.split(" ")[3]},'video')
        }
           if (msg.button.split(" ")[1] === "wm"){
                return await msg.sendReply({url: msg.button.split(" ")[3]},'video')
                }
                if (msg.button.includes("aud")){
                    return await msg.sendReply({url: msg.button.split(" ")[3]},'audio')
                    }     
        }
        }));
    