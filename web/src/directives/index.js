import Vue from 'vue'

const DireactiveContext = require.context('./', false, /\.js$/)

const DireactiveAll = {
	install () {
		DireactiveContext.keys().forEach(path => {
				if (path !== 'index.js') {
					const item = DireactiveContext(path).default
					Vue.directive(item.name, item)
				}
		})
	}
}

export default DireactiveAll

