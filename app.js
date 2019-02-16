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
    countryInput.setAttribute('placeholder', 'Enter City');

    const submit = document.createElement('input');
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'Add');

    // append form elements
    form.appendChild(cityInput);
    form.appendChild(countryInput);
    form.appendChild(submit);

    // create form submit handler
    form.onsubmit = e => {
        e.preventDefault();

        const city = document.querySelector('#city').value;
        const country = document.querySelector('#country').value;

        getData(city, country, table);
        document.querySelector('#city').value = '';
        document.querySelector('#country').value = '';
    };
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
});

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
    const time = moment.tz(tzData.zoneName).format('h:m a');
    const countryName = tzData.countryName;
    const cityName = weatherData.name;
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
    const cityEl = document.createElement('td');
    const timeEl = document.createElement('td');
    const tempEl = document.createElement('td');
    const humidityEl = document.createElement('td');
    const imgEl = document.createElement('td');
    const removeButton = document.createElement('td');

    // assign data to elements
    cityEl.textContent = `${cityName}, ${countryName}`;
    timeEl.textContent = time;
    tempEl.textContent = `${temp} \xB0F`;
    humidityEl.textContent = `humidity: ${humidity}%`;
    const img = document.createElement('img');
    img.setAttribute(
        'src',
        `http://openweathermap.org/img/w/${weatherIcon}.png`
    );
    img.setAttribute('style', 'height: 25px; width: 25px');
    imgEl.appendChild(img);
    removeButton.textContent = 'remove';
    removeButton.onclick = e => e.target.parentElement.remove();

    // append table cells to parent (table row)
    tr.appendChild(cityEl);
    tr.appendChild(timeEl);
    tr.appendChild(tempEl);
    tr.appendChild(humidityEl);
    tr.appendChild(imgEl);
    tr.appendChild(removeButton);

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
}
