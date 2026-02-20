document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       FIREBASE ACTIVE USER COUNTER (ADDED)
    ========================================== *

const firebaseConfig = {
  apiKey: "AIzaSyDuolr2k4C9HqV5NtwSRl2Qzixut7qfCvU",
  authDomain: "weekly-hours-calculator.firebaseapp.com",
  databaseURL: "https://weekly-hours-calculator-default-rtdb.firebaseio.com",
  projectId: "weekly-hours-calculator",
  storageBucket: "weekly-hours-calculator.firebasestorage.app",
  messagingSenderId: "321502142034",
  appId: "1:321502142034:web:555c17ca7e2690f033c98b"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();
const usersRef = database.ref("activeUsers");

let sessionId = sessionStorage.getItem("firebaseSessionId");

if (!sessionId) {
    sessionId = Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem("firebaseSessionId", sessionId);

    const userRef = usersRef.child(sessionId);
    userRef.onDisconnect().remove();
    userRef.set(true);
}

usersRef.on("value", snapshot => {
    const count = snapshot.numChildren();
    document.getElementById("activeUsers").textContent = count;
});

    /* =========================================
       YOUR ORIGINAL CODE STARTS HERE
    ========================================== */

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

    function updateDecimal() {
        const hours = parseFloat(hoursInput.value) || 0;
        const minutes = parseFloat(minutesInput.value) || 0;
        const decimal = hoursAndMinutesToDecimal(hours, minutes);
        decimalHoursInput.value = decimal.toFixed(2);
    }

    hoursInput.addEventListener('input', updateDecimal);
    minutesInput.addEventListener('input', updateDecimal);

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

    function setDefaultEndingTime() {
        const rows = document.querySelectorAll('#timeTableBody tr');
        rows.forEach(row => {
            const endPeriodSelect = row.querySelectorAll('select')[1];
            endPeriodSelect.value = 'PM';
        });
    }

    setDefaultEndingTime();

    document.querySelectorAll('input[type="number"]').forEach(function (input) {
        input.addEventListener('keydown', function (e) {
            if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                e.preventDefault();
            }
        });
    });

    loadStoredData();

    tableBody.addEventListener('keydown', function (e) {
        if (e.target.classList.contains('hour-input') || e.target.classList.contains('minute-input')) {
            if (["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete"].includes(e.key)) return;
            if (isNaN(e.key) || e.key === 'e' || e.key === 'E') e.preventDefault();
        }
    });

    tableBody.addEventListener('input', function (e) {
        if (e.target.classList.contains('hour-input')) {
            let val = parseInt(e.target.value);
            if (val < 1 || val > 12) e.target.value = '';
        } else if (e.target.classList.contains('minute-input')) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length > 2) val = val.substring(0, 2);
            if (parseInt(val) > 59) val = '59';
            e.target.value = val;
        }

        saveData();
    });

    function convertTo24HourFormat(hour, minute, period) {
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;
        return hour + minute / 60;
    }

    function roundToNearestQuarterHour(hoursWorked) {
        const totalMinutes = Math.round(hoursWorked * 60);
        const roundedMinutes = Math.round(totalMinutes / 15) * 15;
        return roundedMinutes / 60;
    }

    roundToggle.style.backgroundColor = roundingEnabled ? "#4CAF50" : "gray";

    roundToggle.addEventListener("click", function () {
        roundingEnabled = !roundingEnabled;
        const message = roundingEnabled
            ? "Rounding Calculation is Enabled"
            : "Rounding Calculation is Disabled";

        roundToggle.textContent = roundingEnabled ? "Enabled" : "Disabled";
        roundToggle.style.backgroundColor = roundingEnabled ? "#4CAF50" : "gray";

        const messageContainer = document.getElementById('messageContainer');
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';

        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 4000);

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

            if (roundingEnabled) {
                startTime = roundToNearestQuarterHour(startTime);
                endTime = roundToNearestQuarterHour(endTime);
            }

            if (endTime < startTime) endTime += 24;

            let hoursWorked = endTime - startTime;
            const breakTime = breakHour + breakMinute / 60;
            hoursWorked = hoursWorked - breakTime > 0 ? hoursWorked - breakTime : 0;

            const roundedDayTotal = (Math.round(hoursWorked * 100) / 100).toFixed(2);
            row.querySelector('.day-total').textContent = roundedDayTotal;
            totalHours += parseFloat(roundedDayTotal);
        });

        totalHoursDisplay.textContent = (Math.round(totalHours * 100) / 100).toFixed(2);
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
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
        inputs.forEach(input => input.value = '');

        const selectElements = document.querySelectorAll('select');
        selectElements.forEach((select, index) => {
            select.selectedIndex = index % 2 === 0 ? 0 : 1;
        });

        document.querySelectorAll('.day-total').forEach(total => {
            total.textContent = '0.00';
        });

        totalHoursDisplay.textContent = '0.00';
        localStorage.removeItem('timeCalculatorData');
    });
});

// Print function
function printPage() {
    window.print();
}



