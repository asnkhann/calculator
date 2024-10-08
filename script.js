document.addEventListener("DOMContentLoaded", function () {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const tableBody = document.getElementById('timeTableBody');
    const calculateBtn = document.getElementById('calculateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const totalHoursDisplay = document.getElementById('totalHours');
    const roundToggle = document.getElementById('roundToggle');
    const roundMessage = document.getElementById('roundMessage');

    let roundingEnabled = false;

    days.forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day}</td>
            <td>
                <input type="number" class="hour-input" placeholder="" maxlength="2"> : 
                <input type="number" class="minute-input" value="00" maxlength="2" placeholder="00"> 
                <select>
                    <option>AM</option>
                    <option>PM</option>
                </select>
            </td>
            <td>
                <input type="number" class="hour-input" placeholder="" maxlength="2"> : 
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
    
// Prevent non-numeric characters like 'e', 'E', and other non-numbers in hour input fields
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
            e.target.value = '';
        }
    } else if (e.target.classList.contains('minute-input')) {
        let val = parseInt(e.target.value);
        if (val < 0 || val > 59) {
            e.target.value = '';
        }
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

    function roundToNearestQuarterHour(hoursWorked) {
        const minutes = (hoursWorked * 60);
        const roundedMinutes = Math.round(minutes / 15) * 15;
        return roundedMinutes / 60;
    }

    roundToggle.addEventListener("click", function () {
        roundingEnabled = !roundingEnabled;
        roundToggle.textContent = roundingEnabled ? "Enabled Rounding" : "Disabled Rounding";
        roundMessage.textContent = roundingEnabled ? "Rounding Calculation is Enabled" : "Rounding Calculation is Disabled";
        calculateHours();
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

            let startTime = convertTo24HourFormat(startHour, startMinute, startPeriod);
            let endTime = convertTo24HourFormat(endHour, endMinute, endPeriod);

            if (endTime < startTime) {
                endTime += 24;
            }

            const breakTime = breakHour + breakMinute / 60;

            let hoursWorked = (endTime - startTime) - breakTime;
            hoursWorked = hoursWorked > 0 ? hoursWorked : 0;

            if (roundingEnabled) {
                hoursWorked = roundToNearestQuarterHour(hoursWorked);
            }

            row.querySelector('.day-total').textContent = hoursWorked.toFixed(2);
            totalHours += hoursWorked;
        });

        totalHoursDisplay.textContent = totalHours.toFixed(2);
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

        localStorage.removeItem('timeCalculatorData');
    });

    const convertButton = document.getElementById('convertButton');
    const decimalOutput = document.getElementById('decimalOutput');

    convertButton.addEventListener("click", function () {
        const minutesInput = document.getElementById('minutesInput').value;
        const minutes = parseInt(minutesInput);

        if (!isNaN(minutes) && minutes >= 0) {
            const decimalValue = (minutes / 60).toFixed(2);
            decimalOutput.textContent = decimalValue;
        } else {
            decimalOutput.textContent = "0.00";
        }
    });

    document.getElementById('minutesInput').addEventListener('input', function () {
        const minutesInput = this.value;
        decimalOutput.textContent = minutesInput ? decimalOutput.textContent : "0.00";
    });
});

function printPage() {
    window.print();
}
