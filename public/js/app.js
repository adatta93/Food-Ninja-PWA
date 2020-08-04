if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/serviceWorker.js")
    .then((res) => console.log("service worker registered ", res))
    .catch((err) => console.log("service worker failed ", err));
}
