const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
}).addTo(map);

const socket = io();

socket.on('attack', (data) => {
    const marker = L.circleMarker([data.lat, data.lng], {
        radius: 8,
        color: 'red'
    }).addTo(map);

    marker.bindPopup("Attack at: " + data.time).openPopup();

    setTimeout(() => {
        map.removeLayer(marker);
    }, 3000);
});
