// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
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
            alert('Logged out successfully!');
            window.location.href = '/login';
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    displayUserProfile();
    handleLogout();
});
