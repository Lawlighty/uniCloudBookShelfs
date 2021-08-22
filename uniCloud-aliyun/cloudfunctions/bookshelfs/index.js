'use strict';
// 新建书房
const { verifyToken } = require("wx-common");
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	const db = uniCloud.database();
	const dbCom = db.command;
	console.log(' event.token', event.token)
	const payload = event.token?verifyToken(event.token):null;
	// actions
	const action = event.action;
	let dbRes;
	if(action === 'create'){
		// 创建我的书架信息
		dbRes = await db.collection("bookshelfs").add({
			owner: payload.openid,
			name:event.name,
			address: event.address,
			geopoint: new db.Geo.Point(event.longitude, event.latitude),
			totalbook: 0
		})
	} else if(action === 'listmy'){
		// 查询我的书架列表信息
		dbRes = await db.collection("bookshelfs").where({
			owner: dbCom.eq(payload.openid)
		})
		.orderBy('_id','desc')
		.limit(10)
		.get()
	} else if(action === 'delete'){
		// 删除书架信息
		dbRes = await db.collection("bookshelfs").where({
			_id: dbCom.eq(event._id),
			owner: dbCom.eq(payload.openid)
		})
		.remove()
	} else if (action === 'update'){
		dbRes = await db.collection("bookshelfs").where({
			_id: dbCom.eq(event._id),
			owner: dbCom.eq(payload.openid)
		})
		.update({
			name:event.name,
			address: event.address,
			geopoint: new db.Geo.Point(event.longitude, event.latitude),
			totalbook: 0
		})
	} else if (action === 'get'){
		// 查询书架信息
		dbRes = await db.collection("bookshelfs").where({
			_id: dbCom.eq(event._id)
		})
		.get()
		console.log('dbRes',dbRes)
		console.log('event._id',event._id)
		let owner = dbRes.data[0]['owner'];
		dbRes.data[0]['isOwner'] = payload?owner == payload.openid:false;
		
		let ownerInfo = await db.collection("users").where({		
			openId: dbCom.eq(owner)
		})
		.get();
		
		dbRes.data[0]['ownerInfo'] = ownerInfo;
	} else if (action === 'listByGeo'){
		// 查询相应位置的书架信息
		dbRes = await db.collection("bookshelfs").where({
			geopoint: dbCom.geoNear({
				geometry: new db.Geo.Point(event.longitude, event.latitude), // 位置信息
				maxDistance: 1000, // 最大距离
				minDistance: 0, // 最小
			})
		})
		.limit(100)
		.get()
	}
	
	//返回数据给客户端
	return dbRes.data;
};
