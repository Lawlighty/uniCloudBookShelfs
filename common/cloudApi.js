let token;

// uniCloud.callFunction 添加 token 代理
function call(option){
	return new Promise((resolve, reject)=>{
		if(!option.data){
			option.data = { };
		}
		if(token){
			option.data.token = token;
		}
		uni.showLoading();
		uniCloud.callFunction({
			name:option.name,
			data:option.data,
			success: (res) => {
				if(res.result.token){
					// 更新本地token
					token = res.result.token;
					console.log('更新本地token',token)
				}
				// 回调
				if(option.success){
					option.success(res);
				}
				resolve(res);
			},
			fail: (err) => {
				// 回调
				if(option.fail){
					option.fail(err);
				}
				reject(err);
			},
			complete:()=>{
				uni.hideLoading();
				if(option.complete){
					option.complete();
				}
			}
		})
	})
}
module.exports = {
	call: call,
	token: token,
}