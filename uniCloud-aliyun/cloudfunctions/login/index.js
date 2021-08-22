'use strict';
const { APPID, SECRET, getToken } = require("wx-common")
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	//  初始化数据库
	const db = uniCloud.database();
	const dbCmd = db.command;
	// jscode2session 获取openid
	const { code } = event;
	const res = await uniCloud.httpclient.request(
		`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`,
		{
			dataType:"json"
		}
	)
	const openId = res.data.openid;
	const token = getToken(openId);
	let userData = {}
	let dbRes = await db.collection("users").where({
		openId: dbCmd.eq(openId)
	}).get();
	console.log('dbRes',dbRes)
	if(dbRes.affectedDocs<=0){
		userData = {
			openId:openId,
			nickName:"微信用户",
			avatarUrl:""
		}
		await db.collection("users").add(userData);
	} else {
		
		userData = dbRes.data[0]
	}
	
	// openId 不需要保存
	delete userData['openId'];
	//  数据库不需要保存token
	userData['token'] = token;
	//返回数据给客户端
	return userData
};
