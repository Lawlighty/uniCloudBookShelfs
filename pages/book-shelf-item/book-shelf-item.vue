<template>
	<view>
		<uni-card
		    :title="bookshelfItem.name"
		    mode="title"
		    :is-shadow="true"
			:extra="showTotalbook(bookshelfItem.totalbook)"
			note="true"
			@click="toBookShelfs"
		>
			<image src="https://vkceyugu.cdn.bspapp.com/VKCEYUGU-dc-site/460d46d0-4fcc-11eb-8ff1-d5dcf8779628.png" style="width: 100%;"></image>
		    {{bookshelfItem.address}}
			<template v-slot:footer>
				<view class="footer-box">
					<view class="item">喜欢</view>
					<view class="item">评论</view>
					<view class="item" @click="toDel">删除</view>
				</view>
			</template>
		</uni-card>
		
		<!-- 确认 -->
		<uni-popup ref="popup_sure_del" type="dialog">
		    <uni-popup-dialog mode="base" type="info" content="确认删除?" :duration="2000" :before-close="true" @close="close" @confirm.stop="confirm"></uni-popup-dialog>
		</uni-popup>
		
		<!--  成功 -->
		<uni-popup ref="popup_del_success" type="message">
		     <uni-popup-message type="success" message="书架删除!" :duration="2000"></uni-popup-message>
		</uni-popup>
	</view>
</template>

<script>
	import cloudApi from '../../common/cloudApi.js'
	export default {
		props:{
			bookshelfItem:{
				type: Object,
				default: function(){
					return {}
				}
			}
		},
		data() {
			return {
				
			}
		},
		computed:{
			
		},
		methods: {
			toDel(){
				this.$refs.popup_sure_del.open()
			},
			confirm(){
				this.$refs.popup_sure_del.close();
				cloudApi.call({
					name:"bookshelfs",
					data:{
						action:'delete',
						...this.bookshelfItem
					},
					success:(res)=>{
						this.$refs.popup_del_success.open();
						this.$emit('getBookshelfs')
					}
				})
			},
			toBookShelfs(){
				uni.navigateTo({
					url:'../book-shelf/book-shelf?id='+this.bookshelfItem._id
				})
			},
			showTotalbook(totalbook){
				return totalbook?`当前藏书${totalbook}本`:'暂无藏书'
			}
		}
	}
</script>

<style>
	.footer-box{
		display: flex;
	}
	.item{
		flex: 1;
		text-align: center;
	}
</style>
