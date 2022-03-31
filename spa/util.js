
/* util.js */

export function err_showMessage(message, delay = 5000) {
	console.log(message)
	document.querySelector('aside p').innerText = message
	document.querySelector('aside').classList.add('err_msg')
	setTimeout(()=>{
		document.querySelector('aside p').innerText = ''
		document.querySelector('aside').classList.remove('err_msg')


	}, delay)
}

export function suc_showMessage(message, delay = 5000) {
	console.log(message)
	document.querySelector('aside p').innerText = message
	document.querySelector('aside').classList.add('suc_msg')
	setTimeout(()=>{
		document.querySelector('aside p').innerText = ''
		document.querySelector('aside').classList.remove('suc_msg')


	}, delay)
}




// function addMsg(){
// 	document.querySelector('aside p').innerText = ''
// 	document.querySelector('aside').classList.remove('msg')

// }

// export function showMessage(message, delay = 6000) {
// 	console.log(message)
// 	document.querySelector('aside p').innerText = message
// 	document.querySelector('aside').classList.remove('hidden')
// 	setTimeout( () => document.querySelector('aside').classList.add('hidden'), delay)
// }

/* NAV FUNCTIONS */

export function loadPage(page) {
	history.pushState(null, null, `/${page}`)
	triggerPageChange()
}

export async function triggerPageChange() {
	console.log('pageChange')
	let page = getPageName()
	console.log(`trying to load page: ${page}`)
	// get a reference to the correct template element
	let template = document.querySelector(`template#${page}`) //?? document.querySelector('template#login') // this is when server starts 
	if(template == null){
		page = 'login'
		template = document.querySelector('template#login')
	}

	const node = template.content.cloneNode(true) // get a copy of the template node
	
	try {
		const module = await import(`./js/${page}.js`)
		await module.setup(node) // the setup script may need to modify the template fragment before it is displayed
	} catch(err) {
		console.warn(`no script for "${page}" page or error in script`)
		console.log(err)
	}
	// replace contents of the page with the correct template
	const article = document.querySelector('article')
	while (article.lastChild) article.removeChild(article.lastChild) // remove any content from the article element
	article.appendChild(node) // insert the DOM fragment into the page
	highlightNav(page)
	article.id = page
}

function getPageName() {
	
	const path2 = window.location.pathname
	
	// this path splits the restauraunt path and restaurant id
	//so it could be used to retrieving a specific restaurant details
	if(path2.includes('restaurantDetails_')){
		const name_id = path2.split('_')
		//console(name_id)
		console.log(`name is: ${name_id[0]} and id is: ${name_id[1]}`)

		const path = name_id[0].replace('/','')

		let page = path ? path : 'login'
		console.log(`page: ${page}`)
		return page

	}else if(path2.includes('addReview_')){
		const name_id = path2.split('_')
		//console(name_id)
		console.log(`name is: ${name_id[0]} and id is: ${name_id[1]}`)

		const path = name_id[0].replace('/','')

		let page = path ? path : 'login'
		console.log(`page: ${page}`)
		return page

	}
	else{
		const path = window.location.pathname.replace('/', '')
		let page = path ? path : 'login'
		console.log(`page: ${page}`)
		return page

	}

	
}

export function highlightNav(page) {
	document.querySelectorAll('nav li').forEach(element => {
		const link = element.querySelector('a').href.replace(`${window.location.origin}/`, '') || 'home'
		if(link === page) {
			element.classList.add('currentpage')
		} else {
			element.classList.remove('currentpage')
		}
	})
	document.querySelector('nav').style.visibility = 'visible'
}

export function customiseNavbar(items) {
	document.querySelectorAll('nav li').forEach(element => {
		const link = element.querySelector('a').href.replace(`${window.location.origin}/`, '') || 'home'
		if(items.includes(link)) {
			element.style.display = 'block'
		} else {
			element.style.display = 'none'
		}
	})
	
}

/* FUNCTIONS USED IN FORMS */

export function createToken(username, password) {
	const token = btoa(`${username}:${password}`)
	return `Basic ${token}`
}

export function file2DataURI(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/* FUNCTIONS TO MAKE API CALLS
 * all API calls support the JSON:API specification */

export async function secureGet(url, token) {
	console.log('secure get')
	const options = {
		method: 'GET',
		headers: {
			'Authorization': token,
			'Content-Type': 'application/vnd.api+json',
			'Accept': 'application/vnd.api+json'
		}
	}
	console.log(options)
	const response = await fetch(url, options)
	const json = await response.json()
	return { status: response.status, json: json }
}
