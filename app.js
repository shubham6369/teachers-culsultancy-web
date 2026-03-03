/**
 * TeachConnect - Core Application Logic
 * Handles Teacher & School recruitment, vacancy posting, notifications, and profile management.
 */

const TeachConnect = (function () {
    // --- Data Management (LocalStorage) ---
    const STORAGE_KEY = 'tc_data';
    let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        users: [],
        vacancies: [],
        applications: [],
        notifications: [],
        currentUser: null
    };

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    // --- Authentication & User Management ---
    function register(userData) {
        const id = 'user_' + Date.now();
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const regNumber = `TC-${year}-${random}`;

        const newUser = {
            ...userData,
            id,
            regNumber,
            createdAt: new Date().toISOString(),
            isProfileComplete: false
        };
        data.users.push(newUser);
        data.currentUser = newUser;
        saveData();
        return newUser;
    }

    function login(email, role) {
        const user = data.users.find(u => (u.email === email || u.phone === email) && u.role === role);
        if (user) {
            data.currentUser = user;
            saveData();
            return user;
        }
        return null;
    }

    function logout() {
        data.currentUser = null;
        saveData();
        window.location.href = 'index.html';
    }

    function getCurrentUser() {
        return data.currentUser;
    }

    function updateProfile(profileData) {
        if (!data.currentUser) return;
        const index = data.users.findIndex(u => u.id === data.currentUser.id);
        if (index !== -1) {
            const updatedUser = { ...data.users[index], ...profileData };

            // Check for profile completeness (only for teachers)
            if (updatedUser.role === 'teacher') {
                const requiredFields = ['name', 'email', 'phone', 'subject', 'experience', 'qualification', 'city', 'state'];
                updatedUser.isProfileComplete = requiredFields.every(field => updatedUser[field] && updatedUser[field].toString().trim() !== '');
            }

            data.users[index] = updatedUser;
            data.currentUser = updatedUser;
            saveData();
            return updatedUser;
        }
    }

    // --- Vacancy Management ---
    function postVacancy(vacancyData) {
        if (!data.currentUser || data.currentUser.role !== 'school') return;

        const id = 'vac_' + Date.now();
        const newVacancy = {
            ...vacancyData,
            id,
            schoolId: data.currentUser.id,
            schoolName: data.currentUser.name || data.currentUser.schoolName,
            location: data.currentUser.city || data.currentUser.state,
            createdAt: new Date().toISOString(),
            status: 'open',
            applicantCount: 0
        };

        data.vacancies.unshift(newVacancy);

        // Notify teachers with matching subjects
        createNotificationsForVacancy(newVacancy);

        saveData();
        return newVacancy;
    }

    function getVacancies(filterSubject = '', filterLocation = '', searchQuery = '') {
        return data.vacancies.filter(v => {
            const matchesSubject = !filterSubject || v.subject === filterSubject;
            const matchesLocation = !filterLocation || v.location.toLowerCase().includes(filterLocation.toLowerCase());
            const matchesSearch = !searchQuery ||
                v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                v.subject.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesLocation && matchesSearch && v.status === 'open';
        });
    }

    function getMyVacancies() {
        if (!data.currentUser) return [];
        return data.vacancies.filter(v => v.schoolId === data.currentUser.id);
    }

    // --- Notification System ---
    function createNotificationsForVacancy(vacancy) {
        const matchingTeachers = data.users.filter(u => u.role === 'teacher' && u.subject === vacancy.subject);

        matchingTeachers.forEach(teacher => {
            const notification = {
                id: 'notif_' + Date.now() + Math.random(),
                userId: teacher.id,
                title: 'New Vacancy in ' + vacancy.subject,
                message: vacancy.schoolName + ' just posted a requirement for ' + vacancy.title + '.',
                relatedId: vacancy.id,
                type: 'vacancy',
                isRead: false,
                createdAt: new Date().toISOString()
            };
            data.notifications.unshift(notification);
        });
    }

    function getMyNotifications() {
        if (!data.currentUser) return [];
        return data.notifications.filter(n => n.userId === data.currentUser.id);
    }

    function markNotificationRead(id) {
        const notif = data.notifications.find(n => n.id === id);
        if (notif) {
            notif.isRead = true;
            saveData();
        }
    }

    // --- Application System ---
    function applyForVacancy(vacancyId, applicationData) {
        if (!data.currentUser || data.currentUser.role !== 'teacher') return;

        // Check if already applied
        const existing = data.applications.find(a => a.vacancyId === vacancyId && a.teacherId === data.currentUser.id);
        if (existing) return { error: 'Already applied' };

        const id = 'app_' + Date.now();
        const vacancy = data.vacancies.find(v => v.id === vacancyId);

        const newApplication = {
            id,
            vacancyId,
            teacherId: data.currentUser.id,
            teacherName: data.currentUser.name,
            teacherSubject: data.currentUser.subject,
            teacherExp: data.currentUser.experience || '0',
            schoolId: vacancy.schoolId,
            schoolName: vacancy.schoolName,
            vacancyTitle: vacancy.title,
            ...applicationData,
            status: 'pending',
            appliedAt: new Date().toISOString()
        };

        data.applications.unshift(newApplication);

        // Update vacancy applicant count
        if (vacancy) {
            vacancy.applicantCount = (vacancy.applicantCount || 0) + 1;
        }

        saveData();
        return newApplication;
    }

    function getTeacherApplications() {
        if (!data.currentUser) return [];
        return data.applications.filter(a => a.teacherId === data.currentUser.id);
    }

    function getSchoolApplicants(vacancyId = '') {
        if (!data.currentUser) return [];
        return data.applications.filter(a => {
            const matchesSchool = a.schoolId === data.currentUser.id;
            const matchesVacancy = !vacancyId || a.vacancyId === vacancyId;
            return matchesSchool && matchesVacancy;
        });
    }

    function updateApplicationStatus(applicationId, status) {
        const app = data.applications.find(a => a.id === applicationId);
        if (app) {
            app.status = status;

            // Notify teacher
            const notification = {
                id: 'notif_' + Date.now(),
                userId: app.teacherId,
                title: status === 'selected' ? 'Congratulations! 🎉' : 'Application Update',
                message: app.schoolName + ' has marked your application for ' + app.vacancyTitle + ' as ' + status + '.',
                relatedId: app.vacancyId,
                type: 'status_change',
                isRead: false,
                createdAt: new Date().toISOString()
            };
            data.notifications.unshift(notification);

            saveData();
            return true;
        }
        return false;
    }

    function getTeacherProfile(teacherId) {
        return data.users.find(u => u.id === teacherId && u.role === 'teacher');
    }

    return {
        register, login, logout, getCurrentUser, updateProfile,
        postVacancy, getVacancies, getMyVacancies,
        getMyNotifications, markNotificationRead,
        applyForVacancy, getTeacherApplications, getSchoolApplicants, updateApplicationStatus,
        getTeacherProfile
    };
})();

// --- UI Logic Helpers ---

// Toast Notifications
function showToast(title, message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    document.getElementById('toast-title').innerText = title;
    document.getElementById('toast-message').innerText = message;

    toast.className = 'toast active ' + type;

    setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('active');
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
}

// Page Navigation
function showPage(pageId, relatedId = null) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    const page = document.getElementById('page-' + pageId);
    if (page) page.classList.add('active');

    const navLink = document.querySelector(`.sidebar-nav a[data-page="${pageId}"]`);
    if (navLink) navLink.classList.add('active');

    // Context-sensitive logic
    if (pageId === 'applicants' && relatedId) {
        const filter = document.getElementById('applicant-vacancy-filter');
        if (filter) {
            filter.value = relatedId;
            filterApplicants(); // Assuming this handles the vacancy-id filter
        }
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('open');
    }
}

// Notifications Panel
function openNotifications() {
    const panel = document.getElementById('notif-panel');
    const overlay = document.getElementById('notif-overlay');
    if (panel) panel.classList.add('open');
    if (overlay) overlay.classList.add('active');

    loadNotifications();
}

function closeNotifications() {
    const panel = document.getElementById('notif-panel');
    const overlay = document.getElementById('notif-overlay');
    if (panel) panel.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
}

function loadNotifications() {
    const list = document.getElementById('notification-list');
    const badge = document.getElementById('notif-badge');
    const badge2 = document.getElementById('notif-badge-2');
    const sidebarCount = document.getElementById('notif-count-sidebar');

    const notifications = TeachConnect.getMyNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (badge) {
        badge.innerText = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    if (badge2) {
        badge2.innerText = unreadCount;
        badge2.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    if (sidebarCount) {
        sidebarCount.innerText = unreadCount > 0 ? unreadCount : '';
    }

    if (!list) return;

    if (notifications.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding: 40px 20px;">
                <div class="empty-icon"><i class="fas fa-bell-slash"></i></div>
                <h3>No Notifications</h3>
                <p>You'll be notified of relevant updates here.</p>
            </div>`;
        return;
    }

    list.innerHTML = notifications.map(n => `
        <div class="notification-item ${n.isRead ? '' : 'unread'}" onclick="handleNotifClick('${n.id}', '${n.relatedId}', '${n.type}')">
            <div class="notif-icon"><i class="fas ${n.type === 'vacancy' ? 'fa-briefcase' : 'fa-info-circle'}"></i></div>
            <div class="notif-content">
                <h4>${n.title}</h4>
                <p>${n.message}</p>
                <div class="notif-time">${formatDate(n.createdAt)}</div>
            </div>
        </div>
    `).join('');
}

function handleNotifClick(notifId, relatedId, type) {
    TeachConnect.markNotificationRead(notifId);
    loadNotifications();
    closeNotifications();

    if (type === 'vacancy') {
        showPage('vacancies');
        // Optionally open specific vacancy if we had vacancy detail views implemented
    } else if (type === 'status_change') {
        showPage('applications');
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000; // in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';

    return date.toLocaleDateString();
}

// --- Teacher Dashboard Specifics ---
function initTeacherDashboard() {
    const user = TeachConnect.getCurrentUser();

    // Fill profile basics
    document.getElementById('welcome-name').innerText = user.name || 'Teacher';
    document.getElementById('sidebar-name').innerText = user.name || 'Teacher';
    document.getElementById('sidebar-avatar').innerText = (user.name || 'T')[0];

    loadTeacherProfile();
    loadTeacherStats();
    loadVacanciesForDashboard();
    loadRecentApplications();
    loadNotifications(); // Initialize unread counts
    updateProfileCompletionUI();
}

function updateProfileCompletionUI() {
    const user = TeachConnect.getCurrentUser();
    const alertBox = document.getElementById('profile-completion-alert');
    if (!alertBox) return;

    if (user.isProfileComplete) {
        alertBox.innerHTML = `
            <div class="completion-alert success">
                <div class="completion-icon"><i class="fas fa-check-circle"></i></div>
                <div class="completion-content">
                    <h4>Profile 100% Complete</h4>
                    <p>Your professional ID card is ready for download.</p>
                </div>
                <button class="btn btn-primary btn-sm" onclick="openIDCard()"><i class="fas fa-id-card"></i> View ID Card</button>
            </div>
        `;
    } else {
        alertBox.innerHTML = `
            <div class="completion-alert">
                <div class="completion-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="completion-content">
                    <h4>Complete Your Profile</h4>
                    <p>Fill in all required details (Experience, Qualification, City, State) to generate your Teacher ID Card.</p>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="showPage('profile')">Finish Now</button>
            </div>
        `;
    }

    // Also update a button in the profile page if it exists
    const profileCard = document.querySelector('.teacher-profile-card');
    if (profileCard) {
        const existingBtn = document.getElementById('btn-id-card-profile');
        if (existingBtn) existingBtn.remove();

        if (user.isProfileComplete) {
            const btn = document.createElement('button');
            btn.id = 'btn-id-card-profile';
            btn.className = 'btn btn-primary btn-full';
            btn.style.marginTop = '16px';
            btn.innerHTML = '<i class="fas fa-id-card"></i> Download ID Card';
            btn.onclick = openIDCard;
            profileCard.appendChild(btn);
        }
    }
}

function openIDCard() {
    const user = TeachConnect.getCurrentUser();
    const wrap = document.getElementById('id-card-wrap');
    if (!wrap) return;

    // Generate unique ID if not exists (retro-compatibility for old users)
    if (!user.regNumber) {
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        user.regNumber = `TC-${year}-${random}`;
        // We don't necessarily need to save it to storage right here, but it's better for consistency
        // However, TeachConnect updateProfile will save it if we pass it.
    }

    wrap.innerHTML = `
        <div class="id-card">
            <div class="card-header">
                <div class="card-logo">
                    <i class="fas fa-chalkboard-teacher"></i>
                    <span>TeachConnect</span>
                </div>
                <div class="photo-container">${(user.name || 'T')[0]}</div>
            </div>
            <div class="card-body">
                <div class="user-name">${user.name}</div>
                <div class="user-role">Certified Teacher</div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Registration No</span>
                        <span class="info-value">${user.regNumber}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Mobile Number</span>
                        <span class="info-value">${user.phone}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Subject Expert</span>
                        <span class="info-value">${user.subject}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <div class="qr-placeholder"><i class="fas fa-qrcode"></i></div>
                <p style="font-size: 8px; color: var(--text-muted); margin-top: 8px;">VERIFIED TEACHCONNECT MEMBER</p>
            </div>
        </div>
    `;

    openModal('idCardModal');
}

function loadTeacherProfile() {
    const user = TeachConnect.getCurrentUser();

    const updateElement = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.innerText = value || 'Not specified';
    };

    updateElement('profile-name', user.name);
    updateElement('profile-subject', user.subject);
    updateElement('profile-location', (user.city ? user.city + ', ' : '') + user.state);
    updateElement('profile-avatar', (user.name || 'T')[0]);
    updateElement('profile-exp', user.experience || '0');

    // Fill Form
    const fillInput = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };

    fillInput('edit-name', user.name);
    fillInput('edit-email', user.email);
    fillInput('edit-phone', user.phone);
    fillInput('edit-subject', user.subject);
    fillInput('edit-experience', user.experience);
    fillInput('edit-city', user.city);
    fillInput('edit-state', user.state);
    fillInput('edit-about', user.about);
    fillInput('edit-skills', user.skills);
    fillInput('edit-qualification', user.qualification);
    fillInput('edit-current-school', user.currentSchool);
}

function saveTeacherProfile(e) {
    e.preventDefault();
    const formData = {
        name: document.getElementById('edit-name').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        subject: document.getElementById('edit-subject').value,
        experience: document.getElementById('edit-experience').value,
        qualification: document.getElementById('edit-qualification').value,
        city: document.getElementById('edit-city').value,
        state: document.getElementById('edit-state').value,
        skills: document.getElementById('edit-skills').value,
        about: document.getElementById('edit-about').value,
        currentSchool: document.getElementById('edit-current-school').value
    };

    TeachConnect.updateProfile(formData);
    loadTeacherProfile();
    showToast('Profile Updated', 'Your teacher profile has been saved successfully.');
    document.getElementById('welcome-name').innerText = formData.name;
    document.getElementById('sidebar-name').innerText = formData.name;
    updateProfileCompletionUI();
}

function loadTeacherStats() {
    const vacancies = TeachConnect.getVacancies();
    const apps = TeachConnect.getTeacherApplications();

    document.getElementById('stat-available').innerText = vacancies.length;
    document.getElementById('stat-applied').innerText = apps.length;
    document.getElementById('stat-pending').innerText = apps.filter(a => a.status === 'pending').length;
    document.getElementById('stat-selected').innerText = apps.filter(a => a.status === 'selected').length;

    const countEl = document.getElementById('profile-applied-count');
    if (countEl) countEl.innerText = apps.length;
    const selectEl = document.getElementById('profile-selected-count');
    if (selectEl) selectEl.innerText = apps.filter(a => a.status === 'selected').length;
}

function loadVacanciesForDashboard() {
    const grid = document.getElementById('dashboard-vacancies');
    const vacancies = TeachConnect.getVacancies().slice(0, 3); // Just 3 for dash

    if (vacancies.length === 0) return;

    grid.innerHTML = vacancies.map(v => renderVacancyCard(v)).join('');
}

function filterVacancies() {
    const search = document.getElementById('vacancy-search').value;
    const subject = document.getElementById('vacancy-subject-filter').value;
    const location = document.getElementById('vacancy-location-filter').value;

    const vacancies = TeachConnect.getVacancies(subject, location, search);
    const grid = document.getElementById('all-vacancies');

    if (vacancies.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-search"></i></div>
                <h3>No Vacancies Found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>`;
        return;
    }

    grid.innerHTML = vacancies.map(v => renderVacancyCard(v)).join('');
}

function renderVacancyCard(v) {
    const user = TeachConnect.getCurrentUser();
    const apps = TeachConnect.getTeacherApplications();
    const isApplied = apps.some(a => a.vacancyId === v.id);

    return `
        <div class="vacancy-card">
            <div class="vacancy-header">
                <div class="school-info">
                    <div class="school-avatar">${v.schoolName[0]}</div>
                    <div>
                        <div class="school-name">${v.schoolName}</div>
                        <div class="school-location"><i class="fas fa-map-marker-alt"></i> ${v.location}</div>
                    </div>
                </div>
                <span class="vacancy-badge ${v.status}">${v.status}</span>
            </div>
            <h4>${v.title}</h4>
            <div class="vacancy-subject">${v.subject}</div>
            <div class="vacancy-details">
                <div class="detail-item"><i class="fas fa-briefcase"></i> ${v.experience || 'Any Exp.'}</div>
                <div class="detail-item"><i class="fas fa-graduation-cap"></i> ${v.qualification || 'B.Ed/Any'}</div>
                <div class="detail-item"><i class="fas fa-wallet"></i> ₹${v.salaryMin || 'N/A'} - ${v.salaryMax || ''}</div>
                <div class="detail-item"><i class="fas fa-history"></i> ${v.type || 'Full-time'}</div>
            </div>
            <p class="vacancy-description">${v.description}</p>
            <div class="vacancy-footer">
                <div class="posted-date">Posted ${formatDate(v.createdAt)}</div>
                <div class="applicant-count"><i class="fas fa-users"></i> ${v.applicantCount || 0} applied</div>
            </div>
            <div style="margin-top: 16px;">
                ${isApplied
            ? `<button class="btn btn-ghost btn-full" disabled><i class="fas fa-check"></i> Already Applied</button>`
            : `<button class="btn btn-primary btn-full" onclick="openApplyModal('${v.id}', '${v.title}')">Apply Now</button>`
        }
            </div>
        </div>
    `;
}

function openApplyModal(id, title) {
    document.getElementById('apply-vacancy-id').value = id;
    document.getElementById('apply-vacancy-title').innerText = title;

    const overlay = document.getElementById('applyModal');
    if (overlay) overlay.classList.add('active');
}

function submitApplication(e) {
    e.preventDefault();
    const vacId = document.getElementById('apply-vacancy-id').value;
    const data = {
        coverLetter: document.getElementById('apply-cover').value,
        availability: document.getElementById('apply-available').value,
        expectedSalary: document.getElementById('apply-salary').value
    };

    const result = TeachConnect.applyForVacancy(vacId, data);
    if (result && result.error) {
        showToast('Error', result.error, 'error');
    } else {
        showToast('Success!', 'Your application has been submitted.');
        closeModal('applyModal');
        initTeacherDashboard();
    }
}

function loadRecentApplications() {
    const list = document.getElementById('dashboard-applications');
    const apps = TeachConnect.getTeacherApplications().slice(0, 5);

    if (apps.length === 0) return;

    list.className = 'applicant-list';
    list.innerHTML = apps.map(renderApplicationCard).join('');
}

function filterApplications(status, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const list = document.getElementById('my-applications');
    let apps = TeachConnect.getTeacherApplications();

    if (status !== 'all') {
        apps = apps.filter(a => a.status === status);
    }

    if (apps.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-file-alt"></i></div>
                <h3>No Applications Found</h3>
                <p>Try browsing more vacancies.</p>
            </div>`;
        return;
    }

    list.innerHTML = apps.map(renderApplicationCard).join('');
}

function renderApplicationCard(a) {
    return `
        <div class="applicant-card">
            <div class="applicant-avatar" style="background: linear-gradient(135deg, #10b981, #14b8a6);">${a.schoolName[0]}</div>
            <div class="applicant-info">
                <div class="applicant-name">${a.vacancyTitle}</div>
                <div class="applicant-subject">${a.schoolName}</div>
                <div class="applicant-meta">
                    <span class="meta-item"><i class="fas fa-calendar"></i> Applied on ${new Date(a.appliedAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="applicant-actions">
                <span class="status-badge ${a.status}">${a.status}</span>
            </div>
        </div>
    `;
}

// --- School Dashboard Specifics ---
function initSchoolDashboard() {
    const user = TeachConnect.getCurrentUser();

    document.getElementById('welcome-name').innerText = user.schoolName || user.name || 'School';
    document.getElementById('sidebar-name').innerText = user.schoolName || user.name || 'School';
    document.getElementById('sidebar-avatar').innerText = (user.schoolName || user.name || 'S')[0];

    loadSchoolProfile();
    loadSchoolStats();
    loadSchoolDashboardVacancies();
    loadSchoolDashboardApplicants();
    populateVacancyFilter();
}

function loadSchoolProfile() {
    const user = TeachConnect.getCurrentUser();
    const fillInput = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };

    fillInput('school-name', user.schoolName || user.name);
    fillInput('school-email', user.email);
    fillInput('school-phone', user.phone);
    fillInput('school-type', user.schoolType);
    fillInput('school-board', user.board);
    fillInput('school-established', user.established);
    fillInput('school-city', user.city);
    fillInput('school-state', user.state);
    fillInput('school-address', user.address);
    fillInput('school-about', user.about);
    fillInput('school-website', user.website);
}

function saveSchoolProfile(e) {
    e.preventDefault();
    const formData = {
        schoolName: document.getElementById('school-name').value,
        name: document.getElementById('school-name').value, // Also update generic name
        email: document.getElementById('school-email').value,
        phone: document.getElementById('school-phone').value,
        schoolType: document.getElementById('school-type').value,
        board: document.getElementById('school-board').value,
        established: document.getElementById('school-established').value,
        city: document.getElementById('school-city').value,
        state: document.getElementById('school-state').value,
        address: document.getElementById('school-address').value,
        about: document.getElementById('school-about').value,
        website: document.getElementById('school-website').value
    };

    TeachConnect.updateProfile(formData);
    showToast('Profile Updated', 'School information has been saved successfully.');
    document.getElementById('welcome-name').innerText = formData.schoolName;
    document.getElementById('sidebar-name').innerText = formData.schoolName;
}

function loadSchoolStats() {
    const vacs = TeachConnect.getMyVacancies();
    const apps = TeachConnect.getSchoolApplicants();

    document.getElementById('stat-total-vacancies').innerText = vacs.length;
    document.getElementById('stat-open-vacancies').innerText = vacs.filter(v => v.status === 'open').length;
    document.getElementById('stat-total-applicants').innerText = apps.length;
    document.getElementById('stat-selected-teachers').innerText = apps.filter(a => a.status === 'selected').length;
}

function postVacancy(e) {
    e.preventDefault();
    const vData = {
        title: document.getElementById('vac-title').value,
        subject: document.getElementById('vac-subject').value,
        experience: document.getElementById('vac-experience').value,
        qualification: document.getElementById('vac-qualification').value,
        positions: document.getElementById('vac-positions').value,
        salaryMin: document.getElementById('vac-salary-min').value,
        salaryMax: document.getElementById('vac-salary-max').value,
        type: document.getElementById('vac-type').value,
        deadline: document.getElementById('vac-deadline').value,
        description: document.getElementById('vac-description').value,
        requirements: document.getElementById('vac-requirements').value
    };

    TeachConnect.postVacancy(vData);
    showToast('Vacancy Posted!', 'Your requirement has been listed and teachers are being notified.');
    showPage('my-vacancies');
    initSchoolDashboard();

    e.target.reset();
}

function loadSchoolDashboardVacancies() {
    const container = document.getElementById('school-dashboard-vacancies');
    const vacs = TeachConnect.getMyVacancies().slice(0, 3);

    if (vacs.length === 0) return;

    container.className = 'vacancy-grid';
    container.innerHTML = vacs.map(v => renderSchoolVacancyCard(v)).join('');
}

function renderSchoolVacancyCard(v) {
    return `
        <div class="vacancy-card">
            <div class="vacancy-header">
                <div>
                    <span class="vacancy-badge ${v.status}">${v.status}</span>
                </div>
                <div class="posted-date">${formatDate(v.createdAt)}</div>
            </div>
            <h4>${v.title}</h4>
            <div class="vacancy-subject">${v.subject}</div>
            <div class="vacancy-details">
                <div class="detail-item"><i class="fas fa-users"></i> ${v.applicantCount || 0} Applied</div>
                <div class="detail-item"><i class="fas fa-clock"></i> ${v.type}</div>
            </div>
            <div style="margin-top: 16px;">
                <button class="btn btn-ghost btn-full" onclick="showPage('applicants', '${v.id}')">View Applicants</button>
            </div>
        </div>
    `;
}

function loadSchoolDashboardApplicants() {
    const list = document.getElementById('school-dashboard-applicants');
    const apps = TeachConnect.getSchoolApplicants().slice(0, 5);

    if (apps.length === 0) return;

    list.innerHTML = apps.map(renderSchoolApplicantCard).join('');
}

function renderSchoolApplicantCard(a) {
    return `
        <div class="applicant-card">
            <div class="applicant-avatar">${a.teacherName[0]}</div>
            <div class="applicant-info">
                <div class="applicant-name">${a.teacherName}</div>
                <div class="applicant-subject">${a.teacherSubject} • ${a.teacherExp} Exp.</div>
                <div class="applicant-meta">
                    <span class="meta-item"><i class="fas fa-file-invoice"></i> For: ${a.vacancyTitle}</span>
                </div>
            </div>
            <div class="applicant-actions">
                ${a.status === 'pending'
            ? `<button class="btn btn-primary btn-sm" onclick="openResume('${a.teacherId}', '${a.id}')">Review Profile</button>`
            : `<span class="status-badge ${a.status}">${a.status}</span>`
        }
            </div>
        </div>
    `;
}

function openResume(teacherId, appID) {
    const teacher = TeachConnect.getTeacherProfile(teacherId);
    const app = TeachConnect.getSchoolApplicants().find(a => a.id === appID);

    if (!teacher) return;

    const content = document.getElementById('resume-content');
    content.innerHTML = `
        <div class="resume-header">
            <div class="resume-avatar">${teacher.name[0]}</div>
            <div class="resume-info">
                <h2>${teacher.name}</h2>
                <div class="resume-subject">${teacher.subject} Expert</div>
                <div class="resume-meta">
                    <span><i class="fas fa-envelope"></i> ${teacher.email}</span>
                    <span><i class="fas fa-phone"></i> ${teacher.phone}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${teacher.city || ''}, ${teacher.state || ''}</span>
                </div>
            </div>
        </div>
        
        <div class="resume-section">
            <h4><i class="fas fa-user"></i> About Me</h4>
            <p>${teacher.about || 'No bio provided.'}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="resume-section">
                <h4><i class="fas fa-graduation-cap"></i> Education</h4>
                <p><strong>Qualification:</strong> ${teacher.qualification || 'N/A'}</p>
            </div>
            <div class="resume-section">
                <h4><i class="fas fa-briefcase"></i> Experience</h4>
                <p><strong>Total:</strong> ${teacher.experience || '0'} Years</p>
                <p><strong>Last School:</strong> ${teacher.currentSchool || 'N/A'}</p>
            </div>
        </div>
        
        <div class="resume-section">
            <h4><i class="fas fa-tools"></i> Skills</h4>
            <div class="resume-skills">
                ${(teacher.skills || '').split(',').map(s => s.trim() ? `<span class="skill-tag">${s.trim()}</span>` : '').join('')}
            </div>
        </div>
        
        <div class="resume-section" style="background: var(--glass); padding: 16px; border-radius: 12px; margin-top: 24px;">
            <h4><i class="fas fa-paper-plane"></i> Application Message</h4>
            <p>"${app.coverLetter}"</p>
            <div style="margin-top: 8px; font-size: 13px;">
                <strong>Availability:</strong> ${app.availability || 'N/A'}<br>
                <strong>Expected Salary:</strong> ${app.expectedSalary || 'N/A'}
            </div>
        </div>
        
        <div style="margin-top: 32px; display: flex; gap: 12px; justify-content: flex-end;">
            ${app.status === 'pending' ? `
                <button class="btn btn-danger" onclick="updateAppStatus('${app.id}', 'rejected')">Reject Application</button>
                <button class="btn btn-success" onclick="updateAppStatus('${app.id}', 'selected')">Select Teacher</button>
            ` : `<span class="status-badge ${app.status}">${app.status}</span>`}
        </div>
    `;

    const overlay = document.getElementById('applyModal') || document.getElementById('resumeModal');
    if (overlay) overlay.classList.add('active');
}

function updateAppStatus(appId, status) {
    TeachConnect.updateApplicationStatus(appId, status);
    showToast('Updated', `Application marked as ${status}.`);
    closeModal('resumeModal');
    initSchoolDashboard();

    // If we're on the full list page, refresh that too
    if (document.getElementById('page-applicants').classList.contains('active')) {
        filterApplicants();
    }
}

function populateVacancyFilter() {
    const filter = document.getElementById('applicant-vacancy-filter');
    if (!filter) return;

    const vacs = TeachConnect.getMyVacancies();
    filter.innerHTML = '<option value="">All Vacancies</option>' +
        vacs.map(v => `<option value="${v.id}">${v.title}</option>`).join('');
}

function filterApplicants() {
    const query = document.getElementById('applicant-search').value.toLowerCase();
    const vacancyId = document.getElementById('applicant-vacancy-filter').value;
    const status = document.getElementById('applicant-status-filter').value;

    let apps = TeachConnect.getSchoolApplicants(vacancyId);

    if (status) {
        apps = apps.filter(a => a.status === status);
    }

    if (query) {
        apps = apps.filter(a =>
            a.teacherName.toLowerCase().includes(query) ||
            a.vacancyTitle.toLowerCase().includes(query) ||
            a.teacherSubject.toLowerCase().includes(query)
        );
    }

    const list = document.getElementById('all-applicants');
    if (apps.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon"><i class="fas fa-users"></i></div>
                <h3>No Applicants Found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>`;
        return;
    }

    list.innerHTML = apps.map(renderSchoolApplicantCard).join('');
}

// Common Modal Close
function closeModal(id) {
    const overlay = document.getElementById(id);
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Global Modal Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// Handle Logout globally
function handleLogout() {
    TeachConnect.logout();
}

// --- Auth Handling for Landing Page ---
window.onload = function () {
    window.selectedRegRole = 'teacher';
};

function handleRoleSelect(role) {
    document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
    const selectedCard = document.querySelector(`.role-card.${role}-role`);
    if (selectedCard) selectedCard.classList.add('selected');
    window.selectedRegRole = role;

    // Show/hide relevant fields
    const teacherFields = document.getElementById('teacher-reg-fields');
    const schoolFields = document.getElementById('school-reg-fields');
    if (teacherFields && schoolFields) {
        teacherFields.style.display = role === 'teacher' ? 'block' : 'none';
        schoolFields.style.display = role === 'school' ? 'block' : 'none';
    }
}

function handleRegister(e) {
    e.preventDefault();
    const role = window.selectedRegRole || 'teacher';

    const baseData = {
        name: document.getElementById('reg-name').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        role: role
    };

    let roleData = {};
    if (role === 'teacher') {
        roleData = {
            subject: document.getElementById('reg-subject').value,
            experience: document.getElementById('reg-experience').value,
            state: document.getElementById('reg-state-teacher').value
        };
    } else {
        roleData = {
            schoolName: document.getElementById('reg-name').value, // Use name for school name
            state: document.getElementById('reg-state-school').value,
            city: document.getElementById('reg-city-school').value
        };
    }

    const user = TeachConnect.register({ ...baseData, ...roleData });

    if (user.role === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
    } else {
        window.location.href = 'school-dashboard.html';
    }
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const role = document.getElementById('login-role').value;

    const user = TeachConnect.login(email, role);
    if (user) {
        if (user.role === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
        } else {
            window.location.href = 'school-dashboard.html';
        }
    } else {
        showToast('Login Failed', 'Invalid credentials or role. Please try again.', 'error');
    }
}

function sendSimulatedOTP() {
    const email = document.getElementById('login-email').value || document.getElementById('reg-email').value;
    if (!email) {
        showToast('Error', 'Please enter an email/phone first.', 'error');
        return;
    }
    showToast('OTP Sent!', 'A 6-digit code has been sent to your device (Simulated: 123456).');
}

// Attach to button in landing page
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('send-otp-btn')) {
        sendSimulatedOTP();
    }
});
