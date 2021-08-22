'use strict';
// 更新用户信息

const { verifyToken } = require("wx-common");

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	const { userInfo, token } = event;
	const db = uniCloud.database();
	const dbCmd = db.command;
	const payload = verifyToken(token);
	
	console.log('userInfo=>',userInfo)
	const dbRes = await db.collection("users").where({
		openId: dbCmd.eq(payload.openid) 
	}).update({
		nickName:userInfo.nickName,
		avatarUrl:userInfo.avatarUrl,
		gender:userInfo.gender,
		country:userInfo.country,
		province:userInfo.province,
		city:userInfo.city,
	})
	console.log('修改 用户信息',dbRes)
	//返回数据给客户端
	return dbRes
};
 