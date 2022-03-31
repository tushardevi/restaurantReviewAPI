
/* login.js */

import { createToken, customiseNavbar, secureGet, loadPage, err_showMessage, suc_showMessage } from '../util.js'

export async function setup(node) {
	try {
		console.log('LOGIN: setup')
		console.log(node)
		
		document.querySelector('header h1').innerText = 'Login'
		customiseNavbar(['register'])

		node.querySelector('form').addEventListener('submit', await login)
	} catch(err) {
		console.error(err)
	}
}

async function login() {
	event.preventDefault()
	console.log('form submitted')
	const formData = new FormData(event.target)
	const data = Object.fromEntries(formData.entries()) 
	const token = 'Basic ' + btoa(`${data.user}:${data.pass}`)

	
	console.log('making call to secureGet')
	const response = await secureGet('/api/accounts', token)
	console.log(response)
	
	if(response.status === 200) {
		localStorage.setItem('username', response.json.data.username)
		localStorage.setItem('authorization', token)
		await loadPage('userHome')
		suc_showMessage(`you are logged in as ${response.json.data.username}`)
	} else {
		document.querySelector('input[name="pass"]').value = ''
		err_showMessage(response.json.errors[0].detail)
		}
}
