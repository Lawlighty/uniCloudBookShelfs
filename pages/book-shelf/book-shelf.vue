<template>
	<view>
		<view class="nav-body">
			<uni-nav-bar  left-icon="back" left-text="返回"  :title="shelfInfo.name" @clickLeft="goBack"></uni-nav-bar>
			
		</view>
		<view class="main">
			<u-grid :col="3">
				<u-grid-item v-for="(item,index) in booksList">
					<u-image width="200rpx" height="300rpx" :src="item.cover_url" :lazy-load="true"></u-image>
					<view class="grid-text">{{ item.title }}</view>
				</u-grid-item>
			</u-grid>
		</view>
		<view>
			<uni-fab
				:content="content"
				horizontal="right"
				vertical="bottom"
				direction="horizontal"
				@trigger="trigger"
			></uni-fab>
		</view>
		<view>
			<u-popup v-model="show" mode="bottom">
				<view>
					<u-button open-type="share" @click="toShare(0)">分享给好友</u-button>
					<u-button open-type="share"  @click="toShare(1)">分享到朋友圈</u-button>
			<!-- 		<u-cell-group>
						<u-cell-item icon="setting-fill" title="分享给好友"  @click="toShare(1)"></u-cell-item>
						<u-cell-item icon="integral-fill" title="分享到朋友圈" :arrow="false" @click="toShare(1)" ></u-cell-item>
					</u-cell-group> -->
				</view>
			</u-popup>
			<!-- <u-action-sheet :list="list" v-model="show" @click="toShare"></u-action-sheet> -->
		</view>
		<canvas id="myPoster" type="2d" style="position: fixed;left: -350px; height: 750px;width: 350px;"></canvas>
	</view>
	
	
</template>

<script>
	import cloudApi from '../../common/cloudApi.js'
	export default {
		data() {
			return {
				shelfId:null,
				shelfInfo:{},
				content:[
					{
						iconPath:'/static/fabIcons/books.png',
						selectedIconPath:'/static/fabIcons/books.png',
						text:'添加图书',
						active: false,
					},
					{
						iconPath:'/static/fabIcons/share.png',
						selectedIconPath:'/static/fabIcons/share.png',
						text:'分享书架',
						active: false,
					},
				],
				booksList: [],
				show: false
			}
		},
		onLoad(options){
			this.shelfId = options.id;
			this.getShelfInfo();
			this.requestBookList();
		},
		methods: {
			goBack(){
				uni.navigateBack({
					
				})
			},
			getShelfInfo(){
				cloudApi.call({
					name:'bookshelfs',
					data:{
						action:'get',
						_id: this.shelfId
					},
					success: (res)=>{
						console.log('getShelfInfo',res)
						this.shelfInfo = res?.result?.[0]
					}
				})
			},
			trigger(e){
				let index = e.index
				switch (index){
					case 0:
						this.btnScan();
						break;
					case 1:
						this.show = true;
						break;
					default:
						console.log('aaa')
				}
			},
			//  添加书籍
			btnScan(){
				uni.scanCode({
					success:(res)=>{
						console.log('scanCode res',res);
						
						cloudApi.call({
							name: 'ISBNQuery',
							data:{
								ISBN:res.result
							},
							success: (res)=>{
								console.log('ISBNQuery res',res);
								 // 书籍添加到书架
								cloudApi.call({
									name: 'books',
									data: {
										action: 'add',
										shelfId: this.shelfId,
										isbnId: res.result._id,
									},
									success: (res)=>{
										this.requestBookList();
									}
								})
							}
						})
					}
				})
			},
			// 查询书架的书籍内容
			requestBookList(){
				cloudApi.call({
					name: 'books',
					data: {
						action: 'listByShelf',
						shelfId: this.shelfId,
					},
					success: (res)=>{
						this.booksList = res.result;
					}
				})
			},
			// 生成 小程序码
			toShare(e){
				console.log('生成 小程序码 e',e)
				if (e===0){
					console.log('生成 小程序码0')
				} else if (e===1){
					console.log('生成 小程序码1')
					this.drawPoster();
				}
			},
			drawPoster(){
				uni.showLoading({
					mask: true,
				});
				
				const query = wx.createSelectorQuery();
				query.select('#myPoster')
				.fields({node: true, size: true})
				.exec(
					async (res)=>{
						let canvas = res[0].node;
						let ctx = canvas.getContext('2d');

						const dpr = uni.getSystemInfoSync().pixelRatio||1;
						canvas.width = res[0].width * dpr;
						canvas.height = res[0].height * dpr;
						ctx.scale(dpr, dpr);

						ctx.fillStyle = '#ffffff';
						ctx.fillRect(0,0,350,750);
						
						ctx.fillStyle = '#000000';
						ctx.fontSize = 16;
						ctx.fillText(this.shelfInfo.name,70,25);
						ctx.fontSize = 12;
						ctx.fillText(this.shelfInfo.ownerInfo.nickName,70,44);
						ctx.fontSize = 12;
						ctx.fillText(this.shelfInfo.address,70,60);
						
						let image = canvas.createImage();
						image.onload = (res) =>{
							ctx.drawImage(image, 10, 15, 50, 50);
							
						};
						image.src = this.shelfInfo.ownerInfo.avatarUrl;
						
						// books
						let bookLength = Math.min(9, this.booksList.length);
						let bookIndex = 0;
						
						let loadNextBook = ()=>{
							let bookItem = this.booksList[bookIndex];
							uni.getImageInfo({
								src: bookItem.cover_url,
								success: (res) => {
									let image = canvas.createImage();
									
									image.onload = ()=>{
										let dx = Math.floor(bookIndex % 3) * (100 + 15) + 10;
										let dy = Math.floor(bookIndex / 3) * (150 + 15) + 80;
										
										ctx.drawImage(image, dx, dy, 100, 150);
										
										if(bookIndex < bookLength - 1){
											bookIndex++;
											loadNextBook();
										} else {
											uni.canvasToTempFilePath({
												canvas: canvas,
												success: (res) => {
													//  预览
													uni.previewImage({
														current: res.tempFilePath,
														urls: [res.tempFilePath]
													})
												}
											})
											uni.hideLoading();
										}
									};
									image.src = res.path;
								}
							})
						};
						loadNextBook();
						return 
						// 加入小程序码
						// const wxcodeRes = await cloudApi.call({
						// 	name: 'getwxacode',
						// 	data:{
						// 		scene: 'sid='+this.shelfInfo._id,
						// 		// page: //不传默认主页面
						// 	}
						// })
						
						// let timestamp = new Date().getTime();
						// const fsm = wx.getFileSystemManager();
						// const FILE_BASE_NAME = 'tmp_img_src' + timestamp;
						// let filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.jpg`;
						// fsm.writeFile({
						//    filePath,
						//    data: uni.arrayBufferToBase64(wxcodeRes.result.data),
						//    encoding: 'base64',
						//    success(res) {
						// 	  uni.getImageInfo({
						// 		 src:filePath,
						// 		 success(res) {
						// 			console.log('getImageInfo success',res)
						// 			let image = canvas.createImage();
						// 			image.onload = () =>{
						// 				ctx.drawImage(image, 350-170, 750-170, 160, 160);
						// 			}
						// 			image.src = res.path;
						// 			loadNextBook();
						// 		 },
						// 		 fail(err) {
						// 			console.log(err);
						// 		 }
						// 	  })
						//    },
						//    fail() {
						// 	  this.canvasFlag = true;
						// 	  uni.showToast({
						// 		 title: '小程序码生成失败',
						// 		 duration: 2000,
						// 		 icon: 'none'
						// 	  });
						//    },
						// });
						// 先存储
						// wx.getFileSystemManager().writeFileSync(
						// 	`${wx.env.USER_DATA_PATH}/mpcode.jpg`,
						// 	uni.arrayBufferToBase64(wxcodeRes.result.data),
						// 	'base64',
						// );
						// console.log('getImageInfo ${wx.env.USER_DATA_PATH}/mpcode.jpg',`${wx.env.USER_DATA_PATH}/mpcode.jpg`)
						// uni.getImageInfo({
						// 	src: `${wx.env.USER_DATA_PATH}/mpcode.jpg`,
						// 	success: (res) => {
						// 		console.log('getImageInfo res=>',res)
						// 		let image = canvas.createImage();
						// 		image.onload = () =>{
						// 			ctx.drawImage(image, 350-170, 750-170, 160, 160);
						// 		}
						// 		image.src = res.path;
						// 		loadNextBook();
						// 	}
						// })
						//wxacode
						const wxacodeRes = await cloudApi.call({
							name:"getwxacode",
							data:{
								scene:"sid="+this.shelfInfo._id
							}
						});
						// let url64 = "data:image/png;base64," + uni.arrayBufferToBase64(wxacodeRes.result.data);
						// let hiddenImage = new Image();
						// hiddenImage.onload=(res)=>{
						//   ctx.drawImage(image, 350-170, 750-170,160,160);
						//   loadNextBook();
						// }
						// hiddenImage.src=url64;
						
						
						wx.getFileSystemManager().writeFileSync(
							`${wx.env.USER_DATA_PATH}/mpcode.jpg`,
							"data:image/png;base64,"+uni.arrayBufferToBase64(wxacodeRes.result.data),
							"base64"
						);
						uni.getImageInfo({
							src:`${wx.env.USER_DATA_PATH}/mpcode.jpg`,
							success: (res) => {
								var image=canvas.createImage();
								image.onload=(res)=>{			
								  ctx.drawImage(image, 350-170, 750-170,160,160);
								  loadNextBook();
								}
								image.src=res.path;
							}
						})
						
						
						
					}
				)
			}
		}
	}
</script>


<style scoped lang="scss">
	.nav-body{
		margin-top: 40rpx;
	}
	
	.main{
		margin: 0 20rpx;
	}
	
	.grid-text {
		font-size: 28rpx;
		margin-top: 4rpx;
		color: $u-type-info;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 200rpx;
	}
</style>
