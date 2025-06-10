document.addEventListener("DOMContentLoaded", function () {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const tableBody = document.getElementById('timeTableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const totalHoursDisplay = document.getElementById('totalHours');
    const roundToggle = document.getElementById('roundToggle');
    const roundMessage = document.getElementById('roundMessage');

    const decimalHoursInput = document.getElementById('decimalHours');
    const hoursInput = document.getElementById('hours');
    const minutesInput = document.getElementById('minutes');
    const swapButton = document.getElementById('swapButton');

    // Enable Decimal Hours by default and disable Hours and Minutes
    decimalHoursInput.disabled = true;
    hoursInput.disabled = false;
    minutesInput.disabled = false;

    function decimalToHoursAndMinutes(decimal) {
        const hours = Math.floor(decimal);
        const minutes = Math.round((decimal - hours) * 60);
        return { hours, minutes };
    }

    function hoursAndMinutesToDecimal(hours, minutes) {
        return parseFloat(hours || 0) + (parseFloat(minutes || 0) / 60);
    }

    // Convert decimal hours to hours and minutes
    decimalHoursInput.addEventListener('input', function () {
        const decimal = parseFloat(decimalHoursInput.value);
        if (!isNaN(decimal)) {
            const { hours, minutes } = decimalToHoursAndMinutes(decimal);
            hoursInput.value = hours;
            minutesInput.value = minutes;
        } else {
            hoursInput.value = '';
            minutesInput.value = '';
        }
    });

    // Convert hours and minutes to decimal
    function updateDecimal() {
        const hours = parseFloat(hoursInput.value) || 0;
        const minutes = parseFloat(minutesInput.value) || 0;
        const decimal = hoursAndMinutesToDecimal(hours, minutes);
        decimalHoursInput.value = decimal.toFixed(2);
    }

    hoursInput.addEventListener('input', updateDecimal);
    minutesInput.addEventListener('input', updateDecimal);

    // Swap between decimal to hours/minutes and hours/minutes to decimal
    swapButton.addEventListener('click', function () {
        if (decimalHoursInput.disabled) {
            decimalHoursInput.disabled = false;
            hoursInput.disabled = true;
            minutesInput.disabled = true;
        } else {
            decimalHoursInput.disabled = true;
            hoursInput.disabled = false;
            minutesInput.disabled = false;
        }
    });

    let roundingEnabled = false;

    // Populate the table with days of the week
    days.forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td>
                <input type="number" class="hour-input" placeholder="" maxlength="2" min="1" max="12"> : 
                <input type="number" class="minute-input" value="00" maxlength="2" placeholder="00"> 
                <select>
                    <option>AM</option>
                    <option>PM</option>
                </select>
            </td>
            <td>
                <input type="number" class="hour-input" placeholder="" maxlength="2" min="1" max="12"> : 
                <input type="number" class="minute-input" value="00" maxlength="2" placeholder="00"> 
                <select>
                    <option>AM</option>
                    <option>PM</option>
                </select>
            </td>
            <td>
                <input type="number" class="break-input" value="" placeholder=""> : 
                <input type="number" class="minute-input" value="00" maxlength="2" placeholder="00"> 
            </td>
            <td><span class="day-total">0.00</span></td>
        `;
        tableBody.appendChild(row);
    });

    // Set default ending time to PM for each day
    function setDefaultEndingTime() {
        const rows = document.querySelectorAll('#timeTableBody tr');
        rows.forEach(row => {
            const endPeriodSelect = row.querySelectorAll('select')[1]; // Select the ending time dropdown (second select)
            endPeriodSelect.value = 'PM'; // Set the default value to PM
        });
    }

    // Call the function to set default values
    setDefaultEndingTime();

    document.querySelectorAll('input[type="number"]').forEach(function(input) {
        input.addEventListener('keydown', function(e) {
            if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    });

    loadStoredData();

    tableBody.addEventListener('keydown', function (e) {
        if (e.target.classList.contains('hour-input') || e.target.classList.contains('minute-input')) {
            if (e.key === "Backspace" || e.key === "Tab" || e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Delete") {
                return;
            }

            if (isNaN(e.key) || e.key === 'e' || e.key === 'E') {
                e.preventDefault();
            }
        }
    });

    tableBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('hour-input')) {
            let val = parseInt(e.target.value);
            if (val < 1 || val > 12) {
                e.target.value = ''; // Clear the input if it's invalid
            }
        } else if (e.target.classList.contains('minute-input')) {
            let val = e.target.value;
            // Remove any non-numeric characters
            val = val.replace(/\D/g, '');

            // Ensure the value is between 0 and 59
            if (val.length > 2) {
                val = val.substring(0, 2); // Restrict to two digits
            }

            if (parseInt(val) > 59) {
                val = '59'; // Cap the value at 59
            }

            e.target.value = val; // Update the input with the cleaned value
        }

        saveData();
    });

    function convertTo24HourFormat(hour, minute, period) {
        if (period === "PM" && hour !== 12) {
            hour += 12;
        } else if (period === "AM" && hour === 12) {
            hour = 0;
        }
        return hour + minute / 60;
    }

    // Updated rounding function for nearest 15 minutes
    function roundToNearestQuarterHour(hoursWorked) {
        const totalMinutes = Math.round(hoursWorked * 60); // Convert hours to minutes
        const roundedMinutes = Math.round(totalMinutes / 15) * 15; // Round to nearest 15 minutes
        return roundedMinutes / 60; // Convert back to hours
    }

    // Set initial button background color
    roundToggle.style.backgroundColor = roundingEnabled ? "#4CAF50" : "gray"; // Set initial color based on state
    
    roundToggle.addEventListener("click", function () {
        roundingEnabled = !roundingEnabled; // Toggle rounding state
        const message = roundingEnabled 
            ? "Rounding Calculation is Enabled" 
            : "Rounding Calculation is Disabled";
        
        // Update toggle button text
        roundToggle.textContent = roundingEnabled ? "Enabled" : "Disabled"; // Change button text
        roundToggle.style.backgroundColor = roundingEnabled ? "#4CAF50" : "gray"; // Change color

        // Display the message
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.textContent = message; // Set the message text
        messageContainer.style.display = 'block'; // Show the message container

        // Hide the message after a few seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 4000); // Hide after 3 seconds

        calculateHours(); // Call function to recalculate hours
    });

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

            if (!startHour || !endHour) {
                row.querySelector('.day-total').textContent = '0.00';
                return;
            }

            // Convert start and end times to 24-hour format
            let startTime = convertTo24HourFormat(startHour, startMinute, startPeriod);
            let endTime = convertTo24HourFormat(endHour, endMinute, endPeriod);

            // Apply rounding if rounding is enabled
            if (roundingEnabled) {
                startTime = roundToNearestQuarterHour(startTime);
                endTime = roundToNearestQuarterHour(endTime);
            }

            // Handle end times after midnight
            if (endTime < startTime) {
                endTime += 24;
            }

            // Calculate hours worked
            let hoursWorked = endTime - startTime;

            const breakTime = breakHour + breakMinute / 60;
            hoursWorked = hoursWorked - breakTime > 0 ? hoursWorked - breakTime : 0;

            row.querySelector('.day-total').textContent = hoursWorked.toFixed(2); // Display day total
            totalHours += hoursWorked;
        });

        totalHoursDisplay.textContent = (Math.round(totalHours * 100) / 100).toFixed(2);  // Display total hours
    }

    function saveData() {
        const rows = tableBody.querySelectorAll('tr');
        const data = [];

        rows.forEach((row) => {
            const startHour = row.querySelectorAll('.hour-input')[0].value;
            const startMinute = row.querySelectorAll('.minute-input')[0].value;
            const startPeriod = row.querySelectorAll('select')[0].value;

            const endHour = row.querySelectorAll('.hour-input')[1].value;
            const endMinute = row.querySelectorAll('.minute-input')[1].value;
            const endPeriod = row.querySelectorAll('select')[1].value;

            const breakHour = row.querySelector('.break-input').value;
            const breakMinute = row.querySelectorAll('.minute-input')[2].value;

            data.push({
                startHour,
                startMinute,
                startPeriod,
                endHour,
                endMinute,
                endPeriod,
                breakHour,
                breakMinute
            });
        });

        localStorage.setItem('timeCalculatorData', JSON.stringify(data));
    }

    function loadStoredData() {
        const storedData = localStorage.getItem('timeCalculatorData');
        if (storedData) {
            const data = JSON.parse(storedData);
            const rows = tableBody.querySelectorAll('tr');

            data.forEach((dayData, index) => {
                const row = rows[index];
                row.querySelectorAll('.hour-input')[0].value = dayData.startHour;
                row.querySelectorAll('.minute-input')[0].value = dayData.startMinute;
                row.querySelectorAll('select')[0].value = dayData.startPeriod;

                row.querySelectorAll('.hour-input')[1].value = dayData.endHour;
                row.querySelectorAll('.minute-input')[1].value = dayData.endMinute;
                row.querySelectorAll('select')[1].value = dayData.endPeriod;

                row.querySelector('.break-input').value = dayData.breakHour;
                row.querySelectorAll('.minute-input')[2].value = dayData.breakMinute;
            });

            calculateHours();
        }
    }

    calculateBtn.addEventListener("click", calculateHours);

    tableBody.addEventListener('input', calculateHours);

    // Clear All Button Event Listener
    clearBtn.addEventListener("click", function () {
        // Clear all input fields
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => {
            input.value = ''; // Clear text and number inputs
        });

        // Reset AM/PM selections to default
        const selectElements = document.querySelectorAll('select');
        selectElements.forEach((select, index) => {
            // Set starting time (first select in the row) to AM
            if (index % 2 === 0) {
                select.selectedIndex = 0; // AM for starting time
            } else {
                select.selectedIndex = 1; // PM for ending time
            }
        });

        // Clear day totals and total hours display
        const dayTotals = document.querySelectorAll('.day-total');
        dayTotals.forEach(total => {
            total.textContent = '0.00'; // Reset totals to 0.00
        });
        totalHoursDisplay.textContent = '0.00'; // Reset total hours display

        // Remove stored data from local storage
        localStorage.removeItem('timeCalculatorData'); // Clear any saved data
    });

});

// Function to print the page
function printPage() {
    window.print();
}
