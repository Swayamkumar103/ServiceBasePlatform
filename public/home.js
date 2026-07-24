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
