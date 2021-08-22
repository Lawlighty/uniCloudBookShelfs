'use strict';
// 爬取 书籍信息
let doubanbook = require('doubanbook');

exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	
	
	let { ISBN } = event;
	
	let db = uniCloud.database();
	let dbCom = db.command;
	let dbRes =await db.collection("isbnlib").where({
		isbn: dbCom.eq(ISBN)
	})
	.get();
	if(dbRes.affectedDocs>0){
		//  直接返回数据库中内容
		return dbRes.data[0]
	} 
	
	let res = await uniCloud.httpclient.request(
		'https://search.douban.com/book/subject_search?search_text='+ISBN,
		{
			dataType:'text', // 流数据 转化为text
		}
	);
	
	let reg = /window\.__DATA__ = "(.*)"/;
	if(reg.test(res.data)){
		let bookData = RegExp.$1;
		// 使用 doubanbook 解码
		let data = doubanbook(bookData)[0];
		
		// 新的书籍 --> 存入数据库
		let coverImage = await uniCloud.httpclient.request(data.cover_url);
		//  上传封面图片
		let uploadRes = await uniCloud.uploadFile({
			cloudPath: ISBN + '.jpg',
			fileContent: coverImage.data,
		});
		
		let resData = {
			isbn: ISBN,
			title: data.title, //  标题
			cover_url: uploadRes.fileID, //  图片
			abstract: data.abstract, // 简介
		};
		
		dbRes = await db.collection('isbnlib').add(resData);
		resData['_id'] = dbRes['_id'];

		return resData
	}
	
	//返回数据给客户端
	// return res
};
