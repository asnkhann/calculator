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
            <td>
                <input type="text" class="hour-input" placeholder="" maxlength="2"> : 
                <input type="text" class="minute-input" value="00" maxlength="2"> 
                <select>
                    <option>AM</option>
                    <option>PM</option>
                </select>
            </td>
            <td>
                <input type="text" class="hour-input" placeholder="" maxlength="2"> : 
                <input type="text" class="minute-input" value="00" maxlength="2"> 
                <select>
                    <option>AM</option>
                    <option>PM</option>
                </select>
            </td>
            <td>
                <input type="text" class="break-input" value=""> : 
                <input type="text" class="minute-input" value="00" maxlength="2">
            </td>
            <td><span class="day-total">0.00</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Restrict hour input to 1-12 and minute input to 0-59
    tableBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('hour-input')) {
            let val = parseInt(e.target.value);
            if (val < 1 || val > 12) {
                e.target.value = '';
            }
        } else if (e.target.classList.contains('minute-input')) {
            let val = parseInt(e.target.value);
            if (val < 0 || val > 59) {
                e.target.value = '';
            }
        }
    });

    // Function to convert time to 24-hour format
    function convertTo24HourFormat(hour, minute, period) {
        if (period === "PM" && hour !== 12) {
            hour += 12;
        } else if (period === "AM" && hour === 12) {
            hour = 0;
        }
        return hour + minute / 60;
    }

    // Function to round to the nearest quarter hour (15 minutes)
    function roundToNearestQuarterHour(hoursWorked) {
        const minutes = (hoursWorked * 60); // convert hours to minutes
        const roundedMinutes = Math.round(minutes / 15) * 15; // round to nearest 15 minutes
        return roundedMinutes / 60; // convert back to hours
    }

    // Toggle button functionality
    roundToggle.addEventListener("click", function () {
        roundingEnabled = !roundingEnabled;
        roundToggle.textContent = roundingEnabled ? "Enabled Rounding" : "Disabled Rounding";
        roundMessage.textContent = roundingEnabled ? "Rounding Calculation is Enabled" : "Rounding Calculation is Disabled";

        // Recalculate total hours when toggling
        calculateHours();
    });

    // Function to calculate hours and update totals
    function calculateHours() {
        let totalHours = 0;
        const rows = tableBody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const startHour = parseInt(row.querySelectorAll('.hour-input')[0].value || 0);
            const startMinute = parseInt(row.querySelectorAll('.minute-input')[0].value || 0);
            const startPeriod = row.querySelectorAll('select')[0].value;

            const endHour = parseInt(row.querySelectorAll('.hour-input')[1].value || 0);
            const endMinute = parseInt(row.querySelectorAll('.minute-input')[1].value || 0);
            const endPeriod = row.querySelectorAll('select')[1].value;

            const breakHour = parseInt(row.querySelector('.break-input').value || 0);
            const breakMinute = parseInt(row.querySelectorAll('.minute-input')[2].value || 0);

            // Convert times to 24-hour format
            let startTime = convertTo24HourFormat(startHour, startMinute, startPeriod);
            let endTime = convertTo24HourFormat(endHour, endMinute, endPeriod);

            // If end time is earlier than start time, assume it goes into the next day
            if (endTime < startTime) {
                endTime += 24;  // Add 24 hours to the end time to account for overnight shifts
            }

            const breakTime = breakHour + breakMinute / 60;

            let hoursWorked = (endTime - startTime) - breakTime;
            hoursWorked = hoursWorked > 0 ? hoursWorked : 0;  // Ensure it isn't negative

            // Apply rounding if enabled
            if (roundingEnabled) {
                hoursWorked = roundToNearestQuarterHour(hoursWorked);
            }

            row.querySelector('.day-total').textContent = hoursWorked.toFixed(2);
            totalHours += hoursWorked;
        });

        totalHoursDisplay.textContent = totalHours.toFixed(2);
    }

    // Calculation button event listener
    calculateBtn.addEventListener("click", calculateHours);

    // Input change event listener to update total hours
    tableBody.addEventListener('input', calculateHours);

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

function printPage() {
    window.print(); // This will open the print dialog
}
