<template>
	<view class="content">
		<image class="logo" :src="userInfo.avatarUrl?userInfo.avatarUrl:'/static/logo.png'" @click="updateUserProfile"></image>
		<view class="text-area">
			<text class="title">{{userInfo.nickName}}</text>
		</view>
		<view class="btnCreateBookShelf-area">
			 <button @click="btnCreateBookShelf" type="primary">新建书房</button>
		</view>
		<view class="btnCreateBookShelf-area">
			 <bookShelfItem v-for="item in bookshelfs" :bookshelfItem="item" @getBookshelfs="getBookshelfs"></bookShelfItem>
		</view>
	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js';
	import bookShelfItem from '../book-shelf-item/book-shelf-item'
	export default {
		data() {
			return {
				title: '我的',
				userInfo:{},// 用户信息
				bookshelfs:[] // 用户书架列表
			}
		},
		components:{
			bookShelfItem
		},
		onLoad() {
			// console.log('获取openID') 用户登录凭证
			uni.login({
				provider: "weixin",
				success:(res) =>{
					console.log('weixin login',res)
					const code = res.code;
					let option = {
						name:"login",
						data:{
							code,
						},
						success:(res) =>{
							this.userInfo = res.result;
							this.getBookshelfs();
						}
					}
					cloudApi.call(option)
				}
			})
		},
		onShow() {
			console.log('this.userInfo',this.userInfo)
			this.userInfo?._id&&this.getBookshelfs();
		},
		methods: {
			updateUserProfile(){
				// 获取用户信息
				uni.getUserProfile({
					// 提示用户
					desc:"是否允许获取信息?",
					success: (res) => {
						this.userInfo = {...this.userInfo, ...res.userInfo}
						console.log('userInfo',this.userInfo)
						cloudApi.call({
							name:"updateUserInfo",
							data:{userInfo:this.userInfo}
						})
					}
				})
			},
			// 跳转创建 书架
			btnCreateBookShelf(){
				uni.navigateTo({
					url:"../createbookshelf/createbookshelf"
				})
			},
			// 查询书架
			getBookshelfs(){
				cloudApi.call({
					name:"bookshelfs",
					data:{
						action:"listmy",
					},
					success:(res)=>{
						console.log('getBookshelfs',res)
						this.bookshelfs = res.result;
					}
				})
			},
			
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
	
	.btnCreateBookShelf-area{
		margin: 20rpx 0;
	}
</style>
