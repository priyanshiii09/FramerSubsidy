document.getElementById('farmerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const contact_number = document.getElementById('contact').value;
    const bank_account = document.getElementById('bank').value;
    const farmer_id = document.getElementById('farmer_id').value;
    const aadhar_number = document.getElementById('aadhar').value;
  
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
  
    try {
      const response = await fetch('http://localhost:3000/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact_number, bank_account, farmer_id, aadhar_number })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        notification.textContent = `✅ Farmer "${data.name}" registered successfully!`;
        notification.className = 'success';
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (err) {
      notification.textContent = `❌ ${err.message}`;
      notification.className = 'error';
    }
  
    notification.classList.remove('hidden');
  });
  