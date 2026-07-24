function getStoredToken() {
    const localToken = localStorage.getItem('token');
    if (localToken) {
        return localToken;
    }

    const cookieMatch = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
}

// Check if user is authenticated
function checkAuth() {
    const token = getStoredToken();
    
    if (!token) {
        alert('Please login first');
        window.location.href = '/login';
        return;
    }
}

// Display user profile info
function displayUserProfile() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const profileEl = document.getElementById('user-profile');
            if (profileEl && user.name) {
                // Display user initials
                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
                profileEl.textContent = initials;
                profileEl.title = user.name;
            }
        } catch (e) {
            console.error('Error parsing user data:', e);
        }
    }
}

// Logout functionality
function handleLogout() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            alert('Logged out successfully!');
            window.location.href = '/login';
        });
    }
}

function shouldProtectPage() {
    // Only enforce auth on actual app routes, not on static file preview or direct file:// views.
    const path = window.location.pathname;
    return path === '/home' || path === '/dashboard';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (shouldProtectPage()) {
        checkAuth();
    }
    displayUserProfile();
    handleLogout();
});


// ---------Get user location --------------
const locationBtn = document.getElementById("location-btn");
const locationInput = document.getElementById("location");

locationBtn.addEventListener("click", () => {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log(lat, lon);

            // Convert coordinates to address using OpenStreetMap
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
            );

            const data = await response.json();

            const address = data.display_name || '';
            locationInput.value = address;

            // Send coordinates + address to server (protected route)
            try {
                const token = getStoredToken();
                const res = await fetch('/api/users/location', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
                    },
                    body: JSON.stringify({ latitude: lat, longitude: lon, address })
                });

                const result = await res.json();
                if (res.ok) {
                    // Update stored user object with location if present
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            user.location = { latitude: lat, longitude: lon, address };
                            localStorage.setItem('user', JSON.stringify(user));
                        } catch (e) { /* ignore parse errors */ }
                    }
                    alert('Location saved successfully');
                } else {
                    console.warn('Failed to save location:', result.message || result);
                }
            } catch (err) {
                console.error('Error saving location:', err);
            }

        },
        () => {
            alert("Unable to get your location.");
        }
    );

});
