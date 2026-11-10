// 1. Find the booking form on our webpage using its ID
const bookingForm = document.getElementById('bookingForm');

// 2. Wait for the user to click the "Confirm Booking" button
bookingForm.addEventListener('submit', function(event) {
    
    // Stop the page from refreshing automatically (the default behavior)
    event.preventDefault();

    // 3. Extract the exact text the client typed into each input field
    const clientName = document.getElementById('client-name').value;
    const clientEmail = document.getElementById('client-email').value;
    const bookingDate = document.getElementById('booking-date').value;

    // 4. Temporarily show a success alert to confirm our code successfully caught the data
    alert(`Success! Booking request received.\nName: ${clientName}\nEmail: ${clientEmail}\nDate: ${bookingDate}`);
    
    // Later on, this is exactly where we will write the code to send this data to Google Calendar!
});
