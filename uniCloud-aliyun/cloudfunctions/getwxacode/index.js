'use strict';

const { getAccessToken } = require('wx-common');

exports.main = async (event, context) => {
 //event为客户端上传的参数
 console.log('event : ', event)
 
 const access_token = await getAccessToken();
 console.log('access_token===>',access_token)
 
 let res = await uniCloud.httpclient.request(`https://api.weixin.qq.com/wxa/getwxacode?access_token=${access_token}`,{
  method: 'POST',
  headers: {
   'Content-Type': 'application/json',
  },
  data: {
   scene: event.scene,
   page: event.page,
  },
 })
 console.log('getwxacode res',res)
 //返回数据给客户端
 return res.data;
};