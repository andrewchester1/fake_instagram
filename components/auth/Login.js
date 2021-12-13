import React, { Component } from 'react'
import { View, Button, TextInput } from 'react-native'

import Firebase from '../../config/firebase'

const auth = Firebase.auth()

export class Login extends Component {
	constructor(props) {
		super(props)

		this.state = {
			email: '',
			password: ''
		}

		this.onSignUp = this.onSignUp.bind(this)
	}

	onSignUp() {
		const { email, password } = this.state
		auth.signInWithEmailAndPassword(email, password)
			.then((result) => {
				console.log(result)
			})
			.catch((error) => {
				console.log(error)
			})
	}

	render() {
		return (
			<View>
				<TextInput
					placeholder="email"
					onChangeText={(email) => this.setState({ email })}
				/>
				<TextInput
					placeholder="password"
					secureTextEntry={true}
					onChangeText={(password) => this.setState({ password })}
				/>

				<Button onPress={() => this.onSignUp()} title="Sign In" />
			</View>
		)
	}
}

export default Login
