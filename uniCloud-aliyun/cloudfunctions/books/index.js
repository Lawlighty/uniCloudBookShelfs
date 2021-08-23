'use strict';

const { verifyToken } = require('wx-common');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	let db = uniCloud.database();
	let dbCom = db.command;
	
	const payload = verifyToken(event.token);
	
	const nowDate = new Date().getTime();
	
	let dbRes;
	if (event.action === 'add'){
		// 由于知道_id 所以直接使用doc
		const bookInfo = await db.collection('isbnlib').doc(event.isbnId).get();
		console.log('bookInfo==>',bookInfo)
		dbRes = await db.collection('books').add({
			owner: payload.openid,
			shelfId: event.shelfId,
			title: bookInfo.data[0].title,
			cover_url: bookInfo.data[0].cover_url,
			isbn: bookInfo.data[0].isbn,
			isbnId: event.isbnId,
			createtime: nowDate,
			updatetime: nowDate,
		});
		
		// 更新书架信息
		let res = await db.collection('bookshelfs').where({
			_id: dbCom.eq(event.shelfId) ,
			owner: dbCom.eq(payload.openid),
			
		})
		.update({
			totalbook: dbCom.inc(1), // increase 自增1
		});
		
		return dbRes;
	} else if (event.action === 'listByShelf'){
		// 查询书架 书籍
		dbRes = await db.collection('books').where({
			shelfId: dbCom.eq(event.shelfId)
		})
		.field({
			owner: false,
		})
		.limit(10)
		.get();
		
		// 聚合查询 除去重复数据
		// const $ = db.command.aggregate;
		// dbRes = await db.collection('books').aggregate().group({
		// 	'_id': '$isbnId', // 书籍相同
		// 	'isbnId': $.last('$isbnId'),
		// 	'title': $.last('$title'),
		// 	'cover_url': $.last('$cover_url'),
		// })
		// .sort({
		// 	'_id': -1,
		// })
		// .end();
		
		// 除去 图书的owner
		// delete
		
		return dbRes.data;
	}
	//返回数据给客户端
	return event
};
