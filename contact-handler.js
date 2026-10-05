// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const messageDiv = document.getElementById('formMessage');
    const fileInput = document.getElementById('attachment');

    if (!form || !messageDiv) {
        console.error('Contact form or message div not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('username', document.getElementById('username').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('phone', document.getElementById('phone').value);
        formData.append('message', document.getElementById('message').value);

        // Add file if selected
        const file = fileInput.files[0];
        if (file) {
            formData.append('attachment', file);
        }

        // Show loading with better message
        messageDiv.innerHTML = '<p style="color: #0a66c2;">⏳ Sending message... (may take 20-30 seconds if server is waking up)</p>';

        try {
            console.log('Sending contact form to: https://skismail-portfolio.onrender.com/api/contact');

            // Add timeout to prevent hanging (increased to 60 seconds for spin-down)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const response = await fetch('https://skismail-portfolio.onrender.com/api/contact', {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            console.log('Response status:', response.status);

            const result = await response.json();
            console.log('Response data:', result);

            if (result.success) {
                messageDiv.innerHTML = '<p style="color: #28a745; font-weight: bold;">✓ Message sent successfully! Thank you for contacting me.</p>';
                form.reset();
            } else {
                messageDiv.innerHTML = '<p style="color: #dc3545;">✗ Failed to send message: ' + (result.message || 'Please try again.') + '</p>';
            }
        } catch (error) {
            console.error('Contact form error:', error);
            if (error.name === 'AbortError') {
                messageDiv.innerHTML = '<p style="color: #dc3545;">✗ Request timed out. The server is waking up (free tier delay). Please wait 30 seconds and try again, or refresh the page first.</p>';
            } else {
                messageDiv.innerHTML = '<p style="color: #dc3545;">✗ Error sending message. Please try again later.</p>';
            }
        }
    });
});
