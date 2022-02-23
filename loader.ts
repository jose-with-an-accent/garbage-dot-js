// simple framework to show off 🧠
// copyleft idk
interface IRoute {
	[key: string]: {
		slice: string, //slice is a piece of HTML content that will be replaced
		inNav: boolean,
		pageName: string,
	}
}
const ROUTES: IRoute = {
	"/": {
		slice: "index",
		inNav: true,
		pageName: "Home",

	},
	"/education": {
		slice: "education",
		inNav: true,
		pageName: "Education"
	},
	"/interests": {
		slice: "interests",
		inNav: true,
		pageName: "Interests"
	},
	"/websites": {
		slice: "websites",
		inNav: true,
		pageName: "Websites"
	}
}
const data = { //currently only data can be taken from this variable
	navigation: [
		ROUTES["/"], ROUTES["/education"], ROUTES["/interests"], ROUTES["/websites"]
	]
}



type SettingsItem = {
	rootElement: HTMLElement,
	localStyleTag: any
	useHash: boolean // uses hashes instead of pathnames; better for servers w/o 
}

const SETTINGS: SettingsItem = {
	// loaderElement: BasicLoader,
	rootElement: document.getElementById("wrapper"),
	localStyleTag: document.getElementById("localStyle"),
	useHash: true
}

// navigation goes here - may later split into its own thing but want to stay compact for now

class Utils {

}

class Animatic { // very basic animation library - mostly relies on CSS animations, but also has a few things
	public static fadeIn = (e: HTMLElement, s: number, props: object) => {
		e.style.animation = `fade-in ${s}s`
	}
	public static fadeOut = (e: HTMLElement) => {

	}

}

class Templated extends HTMLElement {
	connectedCallback() {
		const itemToIterateOver = data[this.getAttribute("fw-iter")]
		console.log(itemToIterateOver)
		const newElements = []
		let a;
		itemToIterateOver.map(val1 => {
			console.log("AAAAA", val1)
			Array.from(this.children).map(val2 => {
				if (val2.getAttribute("fw-value")) {
					const e = val2.cloneNode()
					e.textContent = val1[val2.getAttribute("fw-value")]
					//@ts-ignore
					e.setAttribute("fw-page", val1[val2.getAttribute("fw-page")])
					//@ts-ignore
					if (e.getAttribute("fw-page") == "index") {
						//@ts-ignore
						e.setAttribute("fw-page", "/")
						a = val2
					}
					newElements.push(e)
				}
			})
		})
		this.removeChild(a)
		newElements.map(e => {
			this.appendChild(e)
		})
		this.innerHTML = this.innerHTML

	}
}
class Router {
	public static fromSlice = async (sliceName) => {
		const item = await Router.getResource(`${sliceName}.slice`)

	}
	public static onNavigate = async (url: string) => {
		console.log(url)
		let u = url.replace(/#/g, "/")

		if (u.indexOf("/") == -1) {
			u = "/" + u 
		}

		console.log("Navigating to: ", u)
		history.pushState({ route: u }, "", u)
		try {
			const page = await Router.getPage(ROUTES[u].slice)
			SETTINGS.rootElement.innerHTML = page

			//for the moment, things are very unoptimized - 
			//requires parsing whole document for style tags and other resources.
			const parser = new DOMParser()
			const doc = parser.parseFromString(page, "text/html")

			const customStyling = doc.querySelector("style[fw=true]")

			if (customStyling) {
				console.log("custom styling was found")
				const newStyles = await Router.getResource(customStyling.getAttribute("ext"))
				SETTINGS.localStyleTag.innerHTML = newStyles
			} else {
				SETTINGS.localStyleTag.innerHTML = ""
			}
			// this will check if a page should be treated as a template or not
			// const endingPos = page.indexOf("-->")
			// if (page.indexOf("<!--#TEMPLATE", 0) !== -1) { //once again, this is probably an AWFUL way of doing things. looks for word immediately after to get variable name 
			// 	//template page
			// 	console.log(page.substring(0, endingPos))
			// }
		} catch (e) {
			console.log("There was an error idk")
		}
	}
	public static getPage = async (pageUrl: string) => {
		const req = await fetch(`${pageUrl}.slice`) //may need .html appended
		const data = await req.text()

		return data

	}
	public static getResource = async (resourceUrl: string) => {
		const req = await fetch(resourceUrl)
		const data = await req.text()

		return data
	}
}

class Animated extends HTMLDivElement {
	constructor() {
		super()
	}
}

class SPALink extends HTMLElement {
	//note - innerHTML too inefficient - if utility, refactor to use template string as per https://dev.to/raghavmisra/better-web-components-pt-1-rendering-children-2hel
	// constructor() {
	// 	super()
	// }
	onLinkClick = (e, page) => {
		e.preventDefault()
		console.log(page)
		Router.onNavigate(page)
	}
	connectedCallback() {
		this.innerHTML = `<a href="#">${this.innerText}</a>`
		this.addEventListener('click', (e) => this.onLinkClick(e, this.getAttribute("fw-page")))
	}
}

type CustomElementArray = {
}

const CUST_ELEMENTS: Array<CustomElementArray> = [
	["", SPALink],
	["nav-bar", Router.fromSlice("header")]
]


async function onInit() {
	// prefetch components required here - 

	// CUST_ELEMENTS.map(val => {
	// 	customElements.define(val[0], val[1])
	// })
	customElements.define('spa-link', SPALink)
	customElements.define('templated-bit', Templated)

	if (SETTINGS.useHash) {
		window.addEventListener('popstate', (e) => Router.onNavigate(window.location.hash)) //watches for back/forward
		Router.onNavigate(window.location.hash)
	}
	else {
		window.addEventListener('popstate', (e) => Router.onNavigate(window.location.pathname)) //watches for back/forward
		Router.onNavigate(window.location.pathname) //loads default url
	}

}
/* NOTE - BC OF TIME CONSTRAINTS, NAVBAR CUSTOM ELEMENT MAY COME IN THE FUTURE */
onInit()