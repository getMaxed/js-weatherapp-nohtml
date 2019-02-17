import { weatherKey, tzKey } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    /*
    |--------------------------------------------------------------------------
    | CREATE A FORM
    |--------------------------------------------------------------------------
    */
    const form = document.createElement('form');

    const cityInput = document.createElement('input');
    cityInput.setAttribute('type', 'text');
    cityInput.setAttribute('id', 'city');
    cityInput.setAttribute('placeholder', 'Enter City');

    const countryInput = document.createElement('input');
    countryInput.setAttribute('type', 'text');
    countryInput.setAttribute('id', 'country');
    countryInput.setAttribute('placeholder', 'Enter Country');

    const submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Add');

    // append form elements
    form.appendChild(cityInput);
    form.appendChild(countryInput);
    form.appendChild(submit);
    /*
    |--------------------------------------------------------------------------
    | CREATE A TABLE
    |--------------------------------------------------------------------------
    */
    const table = document.createElement('table');
    table.setAttribute('style', 'border-collapse: collapse');
    /*
    |--------------------------------------------------------------------------
    | APPEND FORM AND TABLE TO THE BODY
    |--------------------------------------------------------------------------
    */
    document.querySelector('body').appendChild(form);
    document.body.appendChild(table);
    /*
    |--------------------------------------------------------------------------
    | CHECK FOR DATA IN THE LOCAL STORAGE
    |--------------------------------------------------------------------------
    */
    const lsData = JSON.parse(localStorage.getItem('weatherappData'));
    (async () => {
        for (const [index, { city, country }] of lsData.entries()) {
            try {
                if (index === 0) {
                    await getData(city, country, table);
                } else {
                    await new Promise(resolve =>
                        setTimeout(
                            () => resolve(getData(city, country, table)),
                            1000
                        )
                    );
                }
            } catch (e) {
                console.error(e);
            }
        }
    })();
    /*
    |--------------------------------------------------------------------------
    | HANDLE FORM SUBMIT
    |--------------------------------------------------------------------------
    */
    form.onsubmit = e => {
        e.preventDefault();

        // gather input vars & parse Local Storage
        const city = document.querySelector('#city').value;
        const country = document.querySelector('#country').value;
        const lsData = JSON.parse(localStorage.getItem('weatherappData'));

        // check for duplicate values
        const duplicateVal = lsData.some(
            obj => obj.city.toUpperCase() === city.toUpperCase()
        );

        // get data
        if (!duplicateVal) getData(city, country, table);

        // clear input
        document.querySelector('#city').value = '';
        document.querySelector('#country').value = '';
    };
});
/*
|--------------------------------------------------------------------------
| GET DATA
|--------------------------------------------------------------------------
*/
async function getData(city, country, table) {
    /*
    |--------------------------------------------------------------------------
    | GET WEATHER
    |--------------------------------------------------------------------------
    */
    const weatherRes = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&APPID=${weatherKey}&units=imperial`
    );
    const weatherData = await weatherRes.json();
    /*
    |--------------------------------------------------------------------------
    | GET TIME
    |--------------------------------------------------------------------------
    */
    const tzRes = await fetch(
        `http://api.timezonedb.com/v2.1/get-time-zone?key=${tzKey}&format=json&by=position&lat=${
            weatherData.coord.lat
        }&lng=${weatherData.coord.lon}`
    );
    const tzData = await tzRes.json();
    /*
    |--------------------------------------------------------------------------
    | COLLECT UI VARS
    |--------------------------------------------------------------------------
    */
    const cityName = weatherData.name;
    const countryName = tzData.countryName;
    const time = moment.tz(tzData.zoneName).format('hh:mm a');
    const temp = Math.floor(weatherData.main.temp);
    const humidity = weatherData.main.humidity;
    const weatherIcon = weatherData.weather[0].icon;
    /*
    |--------------------------------------------------------------------------
    | CREATE TABLE ROW
    |--------------------------------------------------------------------------
    */
    const tr = document.createElement('tr');

    // create table cells
    const locationCell = document.createElement('td');
    const timeCell = document.createElement('td');
    const temperatureCell = document.createElement('td');
    const humidityCell = document.createElement('td');
    const imgCell = document.createElement('td');
    const removeButtonCell = document.createElement('td');

    // assign data to elements
    locationCell.textContent = `${cityName}, ${countryName}`;
    locationCell.classList.add('location');
    timeCell.textContent = time;
    timeCell.classList.add('time');
    temperatureCell.textContent = `${temp} \xB0F`;
    humidityCell.textContent = `humidity: ${humidity}%`;
    const img = document.createElement('img');
    img.setAttribute(
        'src',
        `http://openweathermap.org/img/w/${weatherIcon}.png`
    );
    img.setAttribute('style', 'height: 25px; width: 25px');
    imgCell.appendChild(img);
    removeButtonCell.textContent = 'remove';

    // append table cells to parent (table row)
    tr.appendChild(locationCell);
    tr.appendChild(timeCell);
    tr.appendChild(temperatureCell);
    tr.appendChild(humidityCell);
    tr.appendChild(imgCell);
    tr.appendChild(removeButtonCell);

    // prepend table row to parent (table)
    table.prepend(tr);

    // set the style of table cells
    const tds = document.querySelectorAll('td');
    for (let i = 0; i < tds.length; i++) {
        if (tds[i].textContent === 'remove') {
            tds[i].setAttribute(
                'style',
                'border: 1px solid #dddddd; padding: auto, 8px; cursor: pointer; color: red'
            );
            break;
        }
        tds[i].setAttribute(
            'style',
            'border: 1px solid #dddddd; padding: auto, 8px'
        );
    }

    // set timer to update the time
    tds.forEach(td => {
        if (td.classList.contains('time')) {
            td.textContent = moment.tz(tzData.zoneName).format('hh:mm a');
            setInterval(() => {
                timeCell.textContent = moment
                    .tz(tzData.zoneName)
                    .format('hh:mm a');
            }, 1000);
        }
    });
    /*
    |--------------------------------------------------------------------------
    | PERSIST DATA TO LOCAL STORAGE
    |--------------------------------------------------------------------------
    */
    let locationNames = [];

    // collect location names
    tds.forEach(td => {
        if (td.classList.contains('location'))
            locationNames.push(td.textContent);
    });
    const locations = [];
    locationNames.map(locationName => {
        const locationObject = {};
        const locationNameSplitted = locationName.split(', ');
        locationObject['city'] = locationNameSplitted[0];
        locationObject['country'] = locationNameSplitted[1];
        locations.push(locationObject);
    });
    localStorage.setItem('weatherappData', JSON.stringify(locations));
    /*
    |--------------------------------------------------------------------------
    | HANDLE REMOVE CITY
    |--------------------------------------------------------------------------
    */
    removeButtonCell.onclick = e => {
        // remove from localStorage
        const locationToRemove = e.target.parentElement.firstChild.textContent.split(
            ', '
        );
        const cityName = locationToRemove[0];
        const lsData = JSON.parse(localStorage.getItem('weatherappData'));
        const filteredLsData = lsData.filter(obj => obj.city !== cityName);
        localStorage.setItem('weatherappData', JSON.stringify(filteredLsData));

        // remove from the DOM
        e.target.parentElement.remove();
    };
}
