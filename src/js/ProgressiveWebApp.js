/**
 * Handles PWA functions (install and service worker).
 */
export class ProgressiveWebApp {
    /**
     * @param {ServiceWorker} serviceWorker the application's service worker
     */
    static initialise() {
        this._worker = null;
        this._beforeInstallEvent = null;
        this._listenerBeforeInstallPrompt = null;
        this._applicationUpdateEvent = null;
        this._listenerApplicationUpdate = null;

        window.addEventListener('beforeinstallprompt', event => this._onBeforeInstallPrompt(event));
        this._initializeWorker();
    }


    /**
     * @returns {ServiceWorker} the application saervice worker or null
     */
    static getServiceWorker() {
        return this._worker;
    }


    /**
     * Set the listener of the 'beforeinstallprompt' event
     */
    static set onBeforeInstallPrompt(listener) {
        if (this._beforeInstallEvent != null)
            listener(this._beforeInstallEvent);
        this._listenerBeforeInstallPrompt = listener;
    }

    /**
     * Set the listener on the 'statechange' event of the worker
     */
    static set onApplicationUpdate(observateur) {

        if (this._applicationUpdateEvent != null)
            observateur(this._applicationUpdateEvent);
        this._listenerApplicationUpdate = observateur;
    }

    /**
     * Initialize the service worker
     */
    static _initializeWorker() {
        // Get the worker's version
        if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel('sw-messages');
            channel.addEventListener('message', event => {
                console.log('Received', event.data);
                if (event.data.version)
                    this._workerVersion = event.data.version;
            });
        }

        if ('serviceWorker' in navigator) {
            // Service worker registration
            navigator.serviceWorker
                .register("/serviceWorker.js")
                .then((register) => {
                    console.log("Service Worker registered");
                    return new Promise((accept, reject) => {
                        register.addEventListener("updatefound", () => {
                            this._worker = register.installing;
                            accept();
                        });
                    });
                })
                // If we have an service worker update, we show the notification to the user
                .then(() => {
                    console.log("New service Worker available");
                    this._worker.addEventListener("statechange", (event) => {
                        if (this._worker.state == "installed") {
                            console.log("New Service Worker installed");
                            if (localStorage.getItem("versionWorker") != null && localStorage.getItem("versionWorker") != this._workerVersion)
                                this._onApplicationUpdate(event);
                            if (this._workerVersion !== undefined)
                                localStorage.setItem("versionWorker", this._workerVersion);
                        }
                    });
                });

            //Reloading of the page
            let reloading;
            navigator.serviceWorker.addEventListener('controllerchange', function () {
                if (!reloading)
                    window.location.reload();
                reloading = true;
            });
        }
    }

    static _onBeforeInstallPrompt(event) {
        this._beforeInstallEvent = event;
        if (this._listenerBeforeInstallPrompt)
            this._listenerBeforeInstallPrompt(event);
    }

    static _onApplicationUpdate(event) {
        this._applicationUpdateEvent = event;
        if (this._listenerApplicationUpdate)
            this._listenerApplicationUpdate(event);
    }
}