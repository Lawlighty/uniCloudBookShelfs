<template>
	<view class="nav-body">
		<uni-nav-bar  title="附近"></uni-nav-bar>
		 <view style=" height: 100%;">
			<map @regionchange="onRangeChanged" @markertap="btnMarkerTap" style="width: 100%; height: 100%;" :latitude="location.latitude" :longitude="location.longitude" :markers="markers" show-location>
			</map>
		</view>
	</view>
</template>

<script>
	import clouldApi from '../../common/cloudApi.js'
	export default {
		data() {
			return {
				location:{},//我的位置信息
				shelfsList:[], // 附近的书架
				markers:[], // 附近的书架标记
			}
		},
		onLoad() {
			uni.getLocation({
				success: (res) => {
					this.location = {
						...res
					}
				}
			})
		},
		methods: {
			// 地图位置变化查询附近markers
			onRangeChanged(e){
				if(e.type == 'end'){
					//  拖动结束
					let latitude = e.detail.centerLocation.latitude;
					let longitude = e.detail.centerLocation.longitude;
					
					clouldApi.call({
						name:'bookshelfs',
						data:{
							action:'listByGeo',
							latitude,
							longitude,
						},
						success:(res)=>{
							console.log('listByGeo res',res)
							let shelfs = res.result||[];
							this.shelfsList = shelfs;
							let markList = [];
							
							for( let i in shelfs){
								let item = shelfs[i];
								markList.push({
									id: i*1,
									width: 55,
									height: 55,
									iconPath:'/static/mapIcons/map_marker_book_shelf.png',
									latitude: item.geopoint.coordinates[1],
									longitude: item.geopoint.coordinates[0],
								})
							}
							
							this.markers = markList;
							
						}
					})
				}
				
			},
			
			//  点击 图标获取详情
			btnMarkerTap(e){
				console.log('btnMarkerTap',e)
				 let markerId = e.detail.markerId;
				 let shelfInfo = this.shelfsList[markerId];
				 uni.navigateTo({
				 	url:'../book-shelf/book-shelf?id='+shelfInfo._id
				 })
			}
		}
	}
</script>

<style>
	page{
		height: 100%;
	}
	.nav-body{
		height: 100vh;
		margin-top: 40rpx;
		display: flex;
		flex-direction: column;
	}
</style>
