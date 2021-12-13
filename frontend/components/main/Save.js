import React, { useState } from 'react'
import { View, TextInput, Image, Button } from 'react-native'

import Firebase from '../../config/firebase'

const auth = Firebase.auth()
export default function Save(props) {
	const [caption, setCaption] = useState('')

	const uploadImage = async () => {
		const uri = props.route.params.image

		const response = await fetch(uri)
		const blob = await response.blob()

		const task = Firebase.storage()
			.ref()
			.child(`post/${auth.currentUser.uid}/${Math.random().toString(36)}`)
			.put(blob)

		const taskProgress = (snapshot) => {
			console.log(`transferred: ${snapshot.bytesTransferred}`)
		}

		const taskCompleted = () => {
			task.snapshot.ref.getDownloadURL().then((snapshot) => {
				savePostData(snapshot)
				console.log(snapshot)
			})
		}

		const taskError = (snapshot) => {
			console.log(snapshot)
		}

		task.on('state_changed', taskProgress, taskError, taskCompleted)
	}

	const savePostData = (downloadURL) => {
		Firebase.firestore()
			.collection('posts')
			.doc(auth.currentUser.uid)
			.collection('userPosts')
			.add({
				downloadURL,
				caption,
				likesCount: 0,
				creation: Firebase.firestore.FieldValue.serverTimeStamp()
			})
			.then(function () {
				props.navigation.popToTop()
			})
	}
	return (
		<View style={{ fles: 1 }}>
			<Image source={{ uri: props.route.params.image }} />
			<TextInput
				placeholder="Caption"
				onChangeText={(caption) => setCaption(caption)}
			/>
			<Button title="Save" onPress={() => uploadImage()} />
		</View>
	)
}
