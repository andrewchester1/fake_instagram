import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Image, FlatList, Button } from 'react-native'

import { connect } from 'react-redux'

import Firebase from '../../config/firebase'

const auth = Firebase.auth()

function Feed(props) {
	const [posts, setPosts] = useState([])

	useEffect(() => {
		console.log('props', props.feed)
		if (
			props.usersFollowingLoaded == props?.following?.length &&
			props?.following?.length !== 0
		) {
			props.feed?.sort(function (x, y) {
				return x.creation - y.creation
			})
			setPosts(props.feed)
		} 
	}, [props.usersFollowingLoaded, props.feed])

	const onLikePress = (userId, postId) => {
		Firebase.firestore()
			.collection('posts')
			.doc(userId)
			.collection('userPosts')
			.doc(postId)
			.collection('likes')
			.doc(auth.currentUser.uid)
			.set({})
	}

	const onDislikePress = (userId, postId) => {
		Firebase.firestore()
			.collection('posts')
			.doc(userId)
			.collection('userPosts')
			.doc(postId)
			.collection('likes')
			.doc(auth.currentUser.uid)
			.delete({})
	}

	return (
		<View style={styles.container}>
			<View style={styles.containerGallery}>
				<FlatList
					numColumns={1}
					horizontal={false}
					data={posts}
					renderItem={({ item }) => (
						<View style={styles.containerImage}>
							<Text style={styles.container}>
								{item.user.name}
							</Text>
							<Image
								style={styles.image}
								source={{ uri: item.downloadURL }}
							/>
							{item.currentUserLike ? (
								<Button
									title="Dislike"
									onPress={() =>
										onDislikePress(item.user.uid, item.id)
									}
								/>
							) : (
								<Button
									title="Like"
									onPress={() =>
										onLikePress(item.user.uid, item.id)
									}
								/>
							)}
							<Text
								onPress={() =>
									props.navigation.navigate('Comment', {
										postId: item.id,
										uid: item.user
									})
								}
							>
								View Comments...
							</Text>
						</View>
					)}
				/>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	containerInfo: {
		margin: 20
	},
	containerGallery: {
		flex: 1
	},
	image: {
		flex: 1,
		aspectRatio: 1 / 1
	},
	containerImage: {
		flex: 1 / 3
	}
})
const mapStateToProps = (store) => ({
	currentUser: store.userState.currentUser,
	following: store.userState.following,
	feed: store.usersState.feed,
	usersFollowingLoaded: store.userState.usersFollowingLoaded
})

export default connect(mapStateToProps, null)(Feed)
