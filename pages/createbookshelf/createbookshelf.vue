<template>
	<view class="mybody">
		<view class="mycontent">
			<uni-forms :modelValue="formData">
				<uni-forms-item label="书架名称" name="name">
					<uni-easyinput type="text" v-model="formData.name" placeholder="请输入书架名称" />
				</uni-forms-item>
				<uni-forms-item name="address" label="书架位置">
					<uni-easyinput type="text" v-model="formData.address" placeholder="请选择位置" @focus.stop="chooseLocation"/>
				</uni-forms-item>
			</uni-forms>
			<button @click="submitForm" confirmtype="primary">创建</button>
		</view>
		<!-- 警告 -->
		<uni-popup ref="popup" type="message">
		     <uni-popup-message type="warn" message="请输入名称和地址!" :duration="2000"></uni-popup-message>
		</uni-popup>
		<!--  成功 -->
		<uni-popup ref="popup_success" type="message">
		     <uni-popup-message type="success" message="书架创建成功!" :duration="2000"></uni-popup-message>
		</uni-popup>
		<!-- 确认 -->
		<uni-popup ref="popup_sure" type="dialog">
		    <uni-popup-dialog mode="base" type="info" content="确认提交?" :duration="2000" :before-close="true" @close="close" @confirm="confirm"></uni-popup-dialog>
		</uni-popup>

	</view>
</template>

<script>
	import cloudApi from "../../common/cloudApi.js"
	export default {
		data() {
			return {
				formData: {
					name:'',
					address:'',
					longitude:'',
					latitude:''
				}
			}
		},
		methods: {
			chooseLocation(){
				 uni.chooseLocation({
					success: (res)=> {
						// console.log('位置名称：' + res.name);
						// console.log('详细地址：' + res.address);
						// console.log('纬度：' + res.latitude);
						// console.log('经度：' + res.longitude);

						this.formData['address'] = res.address+res.name;
						this.formData['latitude'] = res.latitude;
						this.formData['longitude'] = res.longitude;
					}
				});
			},
			submitForm(){
				if(this.formData.name&&this.formData.address){
					this.$refs.popup_sure.open();
				} else {
					this.open()
				}
				
			},
			open() {
				this.$refs.popup.open()
			},
			close() {
				this.$refs.popup_sure.close();
				this.$refs.popup.close();
			},
			confirm(){
				cloudApi.call({
					name:"bookshelfs",
					data:{
						action:'create',
						name: this.formData.name,
						address: this.formData.address,
						latitude: this.formData.latitude,
						longitude: this.formData.longitude,
						// token: cloudApi.token,
					},
					success:(res)=>{
						this.$refs.popup_sure.close();
						// this.$refs.popup_success.open()
						uni.navigateBack({
							
						})
					}
				})
			}
		}
	}
</script>

<style>
	.mybody{
		margin: 120rpx 20rpx 0 20rpx;
	}
	.mycontent{
		width: 100%;
	}
</style>
