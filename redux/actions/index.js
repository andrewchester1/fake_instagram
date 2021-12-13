import {
	USER_POSTS_STATE_CHANGE,
	USER_STATE_CHANGE,
	USER_FOLLOWING_STATE_CHANGE,
	USERS_DATA_STATE_CHANGE,
	USERS_POSTS_STATE_CHANGE,
	CLEAR_DATA
} from '../constants/index'

import Firebase from '../../config/firebase'

const auth = Firebase.auth()

export function clearData() {
	return (dispatch) => {
		dispatch({ type: CLEAR_DATA })
	}
}

export function fetchUser() {
	return (dispatch) => {
		Firebase.firestore()
			.collection('users')
			.doc(auth.currentUser.uid)
			.get()
			.then((snapshot) => {
				if (snapshot.exists) {
					dispatch({
						type: USER_STATE_CHANGE,
						currentUser: snapshot.data()
					})
				} else {
					console.log('does not exist')
				}
			})
	}
}

export function fetchUserPosts() {
	return (dispatch) => {
		Firebase.firestore()
			.collection('posts')
			.doc(auth.currentUser.uid)
			.collection('userPosts')
			.orderBy('creation', 'asc')
			.get()
			.then((snapshot) => {
				let posts = snapshot.docs.map((doc) => {
					const data = doc.data()
					const id = doc.id
					return { id, ...data }
				})
				dispatch({
					type: USER_POSTS_STATE_CHANGE,
					posts
				})
			})
	}
}

export function fetchUserFollowing() {
	return (dispatch) => {
		Firebase.firestore()
			.collection('following')
			.doc(auth.currentUser.uid)
			.collection('userFollowing')
			.onSnapshot((snapshot) => {
				let following = snapshot.docs.map((doc) => {
					const id = doc.id
					return id
				})
				dispatch({
					type: USER_FOLLOWING_STATE_CHANGE,
					following
				})
				for (let i = 0; i < following.length; i++) {
					dispatch(fetchUsersData(following[i]))
				}
			})
	}
}

export function fetchUsersData(uid) {
	return (dispatch, getState) => {
		const found = getState().usersState.users.some((el) => el.uid === uid)

		if (!found) {
			Firebase.firestore()
				.collection('users')
				.doc(uid)
				.get()
				.then((snapshot) => {
					if (snapshot.exists) {
						let user = snapshot.data()
						user.uid = snapshot.id
						dispatch({
							type: USERS_DATA_STATE_CHANGE,
							user
						})
						dispatch(fetchUserFollowingPosts(user.id))
					} else {
						console.log('does not exist')
					}
				})
		}
	}
}

export function fetchUserFollowingPosts(uid) {
	return (dispatch, getState) => {
		Firebase.firestore()
			.collection('posts')
			.doc(uid)
			.collection('userPosts')
			.orderBy('creation', 'asc')
			.get()
			.then((snapshot) => {
				const uid = snapshot.query.EP.path.segments[1]
				const user = getState().usersState.users.find(
					(el) => el.uid === uid
				)

				let posts = snapshot.docs.map((doc) => {
					const data = doc.data()
					const id = doc.id
					return { id, ...data, user }
				})
				dispatch({
					type: USERS_POSTS_STATE_CHANGE,
					posts,
					uid
				})
			})
	}
}
