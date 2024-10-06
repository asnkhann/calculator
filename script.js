document.addEventListener("DOMContentLoaded", function () {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const tableBody = document.getElementById('timeTableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const totalHoursDisplay = document.getElementById('totalHours');
    const roundToggle = document.getElementById('roundToggle');
    const roundMessage = document.getElementById('roundMessage');

    let roundingEnabled = false; // Rounding is disabled by default

    // Create table rows dynamically for each day
    days.forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td><input type="text" class="hour-input"> : <input type="text" class="minute-input" value="00"> 
                <select><option>AM</option><option>PM</option></select></td>
            <td><input type="text" class="hour-input"> : <input type="text" class="minute-input" value="00"> 
                <select><option>AM</option><option>PM</option></select></td>
            <td><input type="text" class="break-input" value=""> : <input type="text" class="minute-input" value="00"></td>
            <td><span class="day-total">0.00</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Function to convert time to 24-hour format
    function convertTo24HourFormat(hour, minute, period) {
        hour = parseInt(hour);
        minute = parseInt(minute);
        
        if (period === "PM" && hour < 12) {
            hour += 12; // Convert PM times except 12 PM
        } else if (period === "AM" && hour === 12) {
            hour = 0; // Convert 12 AM to 0 (midnight)
        }

        return hour + minute / 60;
    }

    // Function to round to the nearest quarter hour (15 minutes)
    function roundToNearestQuarterHour(hoursWorked) {
        const minutes = hoursWorked * 60; // Convert hours to minutes
        const roundedMinutes = Math.round(minutes / 15) * 15; // Round to nearest 15 minutes
        return roundedMinutes / 60; // Convert back to hours
    }

    // Toggle button functionality
    roundToggle.addEventListener("click", function () {
        roundingEnabled = !roundingEnabled;
        if (roundingEnabled) {
            roundToggle.textContent = "Enabled Rounding";
            roundMessage.textContent = "Rounding Calculation is Enabled";
        } else {
            roundToggle.textContent = "Disabled Rounding";
            roundMessage.textContent = "Rounding Calculation is Disabled";
        }
        // Update total hours when rounding is toggled
        calculateTotalHours();
    });

    // Calculation button event listener
    calculateBtn.addEventListener("click", calculateTotalHours);

    function calculateTotalHours() {
        let totalHours = 0;
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const startHour = row.querySelectorAll('.hour-input')[0].value;
            const startMinute = row.querySelectorAll('.minute-input')[0].value;
            const startPeriod = row.querySelectorAll('select')[0].value;

            const endHour = row.querySelectorAll('.hour-input')[1].value;
            const endMinute = row.querySelectorAll('.minute-input')[1].value;
            const endPeriod = row.querySelectorAll('select')[1].value;

            const breakHour = row.querySelector('.break-input').value || 0;
            const breakMinute = row.querySelectorAll('.minute-input')[2].value || 0;

            // Convert times to 24-hour format
            const startTime = convertTo24HourFormat(startHour, startMinute, startPeriod);
            const endTime = convertTo24HourFormat(endHour, endMinute, endPeriod);

            const breakTime = parseFloat(breakHour) + parseFloat(breakMinute) / 60;

            let hoursWorked = (endTime - startTime) - breakTime;
            hoursWorked = hoursWorked > 0 ? hoursWorked : 0; // Ensure no negative values

            // Apply rounding if enabled
            if (roundingEnabled) {
                hoursWorked = roundToNearestQuarterHour(hoursWorked);
            }

            row.querySelector('.day-total').textContent = hoursWorked.toFixed(2);
            totalHours += hoursWorked;
        });

        totalHoursDisplay.textContent = totalHours.toFixed(2);
    }

    // Clear button event listener
    clearBtn.addEventListener("click", function () {
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            input.value = '';
        });
        const dayTotals = document.querySelectorAll('.day-total');
        dayTotals.forEach(total => {
            total.textContent = '0.00';
        });
        totalHoursDisplay.textContent = '0.00';
    });
});
