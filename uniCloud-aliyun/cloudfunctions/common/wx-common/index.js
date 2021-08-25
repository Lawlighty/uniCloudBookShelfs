const APPID = 'wx04e42c9cdb293702';
const SECRET = '5229cb9c895e6b7eb38e424703100edd';
const jwt = require("jsonwebtoken");

// module.exports = function(e) {
//  // 公用模块用法请参考 https://uniapp.dcloud.io/uniCloud/cf-common
//  return e
// }

const db = uniCloud.database();
let dbCom = db.command;

function getToken(openId){
 return jwt.sign(
  //  加密者
  {
   openid:openId
  },
  // 加盐
  SECRET,
  // 过期时间
  {expiresIn:60*60*24}
 );
}

function verifyToken(token){
 return jwt.verify(token, SECRET)
}

async function requestNewAccessToken( create = false ){
 
 let res = await uniCloud.httpclient.request(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${SECRET}`,{
   dataType:"json"
  });
 console.log('requestNewAccessToken res',res)
 if(create){
  // 新增
  console.log('add accessToken')
  await db.collection('system').add({
   accessToken:{
    value: res.data.access_token,
    expiredtime: new Date().getTime() + 7000000,
   } 
  })
 } else {
  // 更新数据库 access_token
  console.log('update accessToken')
  await db.collection('system').doc('6125e558cd84d60001371106').update({
   accessToken:{
    value: res.data.access_token,
    expiredtime: new Date().getTime() + 7000000,
   } 
  })
 }
 
 return res.data.access_token;
}

async function getAccessToken(forceUpdate = false){
 // 先去查询 system 表 是否有 access_token 判断是否过期
 let dbRes = await db.collection('system').doc('6125e558cd84d60001371106').get();
 console.log('getAccessToken', dbRes)
 if(!dbRes.data.length){
  // 不存在
  const access_token = await requestNewAccessToken(true);
  console.log('不存在 创建的access_token',access_token)
  return access_token;
 }
 const systemInfo = dbRes.data[0];
 const nowDate = new Date().getTime();
 
 if(systemInfo.accessToken.value && !forceUpdate){
  if(nowDate>systemInfo.accessToken.expiredtime){
   // 过期
   const access_token = await requestNewAccessToken();
   return access_token;
  } else {
   console.log('system 中获取 ',systemInfo.accessToken.value)
   return systemInfo.accessToken.value
  }
 }
 
}

module.exports = {
 APPID,
 SECRET,
 getToken,
 verifyToken,
 getAccessToken,
}