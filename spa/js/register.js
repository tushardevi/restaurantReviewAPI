
/* register.js */

import { customiseNavbar, loadPage, err_showMessage, suc_showMessage } from '../util.js'

export async function setup(node) {
	try {
		console.log('REGISTER: setup')
		console.log(node)
		document.querySelector('header h1').innerText = 'Register'
		customiseNavbar(['home', 'register', 'login'])
		node.querySelector('form').addEventListener('submit', await register)
	} catch(err) { // this will catch any errors in this script
		console.error(err)
	}
}

async function register() {
	event.preventDefault()
	const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries())
	console.log(data)
	
	const url = '/api/accounts'
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/vnd.api+json',
			
		},
		body: JSON.stringify(data)
	}
	const response = await fetch(url, options)
	const json = await response.json()
	console.log(json)
	suc_showMessage('new account registered')
	loadPage('login')
}