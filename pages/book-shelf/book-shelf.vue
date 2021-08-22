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
						active: true,
					}
				],
				booksList: [],
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
