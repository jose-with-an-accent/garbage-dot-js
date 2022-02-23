// simple framework to show off 🧠
// copyleft idk
interface IRoute {
	[key: string]: {
		slice: string, //slice is a piece of HTML content that will be replaced
		inNav: boolean,
		pageName: string
	}
}

const ROUTES: IRoute = {
	"/": {
		slice: "index",
		inNav: true,
		pageName: "Home"
		

	},
	"/education": {
		slice: "education",
		inNav: true,
		pageName: "Home"
	}
}
class Loader extends HTMLDivElement {

}
class BasicLoader extends Loader {

}

type SettingsItem = {
	loaderElement: any,
	rootElement: HTMLElement,
	localStyleTag: any
	useHash: boolean // uses hashes instead of pathnames; better for servers w/o 
}

const SETTINGS: SettingsItem = {
	loaderElement: BasicLoader,
	rootElement: document.getElementById("wrapper"),
	localStyleTag: document.getElementById("localStyle"),
	useHash: true
}

// navigation goes here - may later split into its own thing but want to stay compact for now

class Animatic { // very basic animation library - mostly relies on CSS animations, but also has a few things
	public static fadeIn = (e: HTMLElement, s: number, props: object) => {
		e.style.animation = `fade-in ${s}s`
	}
	public static fadeOut = (e: HTMLElement) => {

	}

}
class Router {
	public static fromSlice = async (sliceName) => {
		const sliceUrl = `${sliceName}.slice.html`
		const req = await fetch(sliceUrl)
		const data = await req.text()

	}
	public static onNavigate = async (url: string) => {
		let u = url.replace(/#/g, "/")

		if (u == "") {
			u = "/"
		}
		
		console.log("Navigating to: ", u)
		history.pushState({route: u}, "", u)
		try {
			const page = await Router.getPage(ROUTES[u].slice)
			SETTINGS.rootElement.innerHTML = page
			console.log("we did it joe")

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
			// 
		} catch (e) {
			console.log("There was an error idk")
		}
	}
	public static getPage = async (pageUrl: string) => {
		const req = await fetch(`${pageUrl}.slice.html`)
		const data = await req.text()

		return data

	}
	public static getResource = async(resourceUrl: string) => {
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
		this.addEventListener('click', (e) => this.onLinkClick(e, this.getAttribute("page")))
	}
}

type CustomElementArray = {
}

const CUST_ELEMENTS: Array<CustomElementArray> = [
	["", SPALink],
	["nav-bar", Router.fromSlice("header")]
]


function onInit() {
	// CUST_ELEMENTS.map(val => {
	// 	customElements.define(val[0], val[1])
	// })
	customElements.define('spa-link', SPALink)
	window.addEventListener('popstate', (e) => Router.onNavigate(window.location.pathname)) //watches for back/forward
	SETTINGS.useHash ? Router.onNavigate(window.location.hash) : Router.onNavigate(window.location.pathname) //loads default url

}

onInit()