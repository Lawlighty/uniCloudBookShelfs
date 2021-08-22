const APPID = 'wx04e42c9cdb293702';
const SECRET = '5229cb9c895e6b7eb38e424703100edd';
const jwt = require("jsonwebtoken");

// module.exports = function(e) {
// 	// 公用模块用法请参考 https://uniapp.dcloud.io/uniCloud/cf-common
// 	return e
// }

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

module.exports = {
	APPID,
	SECRET,
	getToken,
	verifyToken,
}