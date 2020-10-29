import { MainUI } from './MainUI';
import { Navigatron } from './Navigatron';

(async() => {
	const mainUI = new MainUI();
	const navigatron = new Navigatron(window.siteMap, mainUI);
	await navigatron.initializeCurrentURL();
	mainUI.fadeLoadingOverlay();
})();

