document.addEventListener('DOMContentLoaded', () => {
    const applicationForm = document.getElementById('application-form');
    const applicationsListDiv = document.getElementById('applications-list');
    const refreshButton = document.getElementById('refresh-button');
    const formMessage = document.getElementById('form-message');
    const listMessage = document.getElementById('list-message');

    
    const API_URL = 'http://localhost:3000/api/applications';

    // Function to display messages
    const showMessage = (element, text, type = 'success') => {
        element.textContent = text;
        element.className = `message ${type}`; // Reset classes and add new ones
        // Automatically hide message after 5 seconds
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message hidden';
        }, 5000);
    };

    // Function to fetch and display applications
    const fetchApplications = async () => {
        applicationsListDiv.innerHTML = '<p>Loading applications...</p>'; // Show loading state
        listMessage.textContent = ''; // Clear previous list errors
        listMessage.className = 'message hidden';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const applications = await response.json();

            applicationsListDiv.innerHTML = ''; // Clear loading/previous content

            if (applications.length === 0) {
                applicationsListDiv.innerHTML = '<p>No applications found.</p>';
                return;
            }

            applications.forEach(app => {
                const appDiv = document.createElement('div');
                appDiv.classList.add('application-item');

                // Format date nicely (optional)
                const submittedDate = new Date(app.submitted_at).toLocaleString();

                appDiv.innerHTML = `
                    <h3>${app.farmer_name}</h3>
                    <p><strong>Contact:</strong> ${app.contact_info || 'N/A'}</p>
                    <p><strong>Subsidy Type:</strong> ${app.subsidy_type}</p>
                    <p><strong>Details:</strong> ${app.details || 'No details provided.'}</p>
                    <p><strong>Status:</strong> <span class="status status-${app.status}">${app.status}</span></p>
                    <p><small>Submitted: ${submittedDate}</small></p>
                `;
                applicationsListDiv.appendChild(appDiv);
            });

        } catch (error) {
            console.error('Error fetching applications:', error);
            applicationsListDiv.innerHTML = ''; // Clear loading message on error
            showMessage(listMessage, `Failed to load applications: ${error.message}`, 'error');
        }
    };

    // Handle form submission
    applicationForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default browser form submission
        formMessage.textContent = ''; // Clear previous form messages
        formMessage.className = 'message hidden';

        const formData = new FormData(applicationForm);
        const data = Object.fromEntries(formData.entries()); // Convert FormData to simple object

        // Client-side validation (basic)
        if (!data.farmer_name || !data.subsidy_type) {
             showMessage(formMessage, 'Farmer name and subsidy type are required.', 'error');
             return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                // Try to get error message from backend response body
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                     const errData = await response.json();
                     errorMsg = errData.error || errorMsg;
                } catch(e) { /* Ignore if response body isn't valid JSON */ }
                throw new Error(errorMsg);
            }

            const newApplication = await response.json(); // Get the created application back
            showMessage(formMessage, `Application submitted successfully! (ID: ${newApplication.id})`, 'success');
            applicationForm.reset(); // Clear the form
            fetchApplications(); // Refresh the list immediately

        } catch (error) {
            console.error('Error submitting application:', error);
            showMessage(formMessage, `Failed to submit application: ${error.message}`, 'error');
        }
    });

    // Refresh button functionality
    refreshButton.addEventListener('click', fetchApplications);

    // Initial load of applications when the page loads
    fetchApplications();
});
