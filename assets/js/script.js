$(function() {
    // By default load Atlanta city
    getCurrentWeather("Atlanta");
    // populate searched cities from local storage and render as buttons
    searched_btn_list();
});
var cities = [];
// openweathermap API KEY
var apiKey_weather = 'c09649ce8ab2b228d992062f0a8f1b58'

// search City form
$("#searchForm").submit(function(e) {
    e.preventDefault();

    // get form data, get city name from input
    const formData = new FormData(e.target);
    const formProps = Object.fromEntries(formData);
    // if city name is not empty
    if (formProps.city != "") {
        // get current weather data
        getCurrentWeather(formProps.city);
        // persisit search city to local storage
        save_searched_cities(formProps.city);
        // populate searched cities from local storage and render as buttons
        searched_btn_list();

    }

});


// to render searched cities buttons
function searched_btn_list() {
    var getcities = localStorage.getItem('cities')
    if (getcities != null) {

        cities = JSON.parse(getcities);
        var markup = '';
        $('#searched_cities').html("");

        // create searched cities buttons dynamically 
        for (let i = 0; i < cities.length; i++) {

            markup += `<button class="btn btn-secondary btn-block" onclick="getCurrentWeather('${cities[i]}')" type="button">${cities[i]}</button>`
        }

        $('#searched_cities').html(markup);
    }
}

function save_searched_cities(city) {
    // get cities from local storage
    var getcities = localStorage.getItem('cities')
    if (getcities != null) {

        cities = JSON.parse(getcities)

        // check if city already exist in local storage then dont save it
        if (!cities.includes(city)) {
            cities.push(city);
            localStorage.setItem('cities', JSON.stringify(cities));

        }

    } else {
        // save first searched city to local storage
        cities.push(city);
        localStorage.setItem('cities', JSON.stringify(cities));
    }
}

function getCurrentWeather(city) {
    // openweathermap API URL
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey_weather}&units=metric`;
    // openweathermap GET API
    fetch(url)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    // create weather icon image url from amazon 
                    const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
                        data.weather[0]["icon"]
                    }.svg`;
                    // set icon image url
                    $('#icon').attr('src', icon)
                        // set temp
                    $('#temp').html(data.main.temp);
                    // set humidity
                    $('#humidity').html(data.main.humidity);
                    // set wind
                    $('#wind').html(data.wind.speed);
                    // convert unix date to readable date
                    var curr_date = new Date(data.dt * 1000).toLocaleDateString("en-US")
                        // set name as search value when button clicked
                    $('input[name="city"]').val(data.name)
                        // set city name and date
                    $('.city_info h2').html(data.name + " " + curr_date)
                    forecastWeather(data.coord.lat, data.coord.lon)
                })
            }
        })

    .catch(() => {
        console.log("Please search for a valid city 😩");
    });
}

// to scale UV and change color as low ,moderate and high
function scaleUV(val) {
    // low
    if (val > 0 && val <= 2) {

        return 'success'
    } // moderate
    else if (val > 2 && val <= 5) {
        return 'warning'
    }
    // high
    else if (val > 6) {
        return 'danger'
    }
}

// get Weather forcast of 5 days
function forecastWeather(lat, lon) {
    // openweathermap forecast API URL
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&exclude=minutely,hourly&lon=${lon}&appid=${apiKey_weather}&cnt=5`;
    // empty the html
    $('#forcast_data').html("");
    // openweathermap GET API
    fetch(url)
        .then(function(response) {
            if (response.ok) {
                response.json().then(function(data) {
                    // get UVI
                    const uvi = data.daily[0].uvi;
                    //create UV badge class name
                    var classname = 'badge bg-' + scaleUV(uvi);
                    // set class name and UV value
                    $('#uv').attr('class', classname);
                    $('#uv').html(uvi);
                    // set 7 days forecast weather array
                    var daily = data.daily;
                    // loop through 7 forecast weather array
                    for (let i = 0; i < daily.length - 1; i++) {
                        // convert unix date to readable date
                        var curr_date = new Date(daily[i].dt * 1000).toLocaleDateString("en-US")
                        var date_now = new Date().toLocaleDateString("en-US")
                            // skip current date weather 
                        if (curr_date != date_now) {
                            // create weather icon image url from amazon 
                            const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${
                                daily[i].weather[0]["icon"]
                            }.svg`;

                            // create forecast HTML data
                            const coldiv = document.createElement("div");
                            coldiv.className = "col"
                            const card_div = document.createElement("div");
                            card_div.className = 'card';
                            const card_body = document.createElement("div");
                            card_body.className = 'card-body';

                            // card body data
                            const markup = `<h5 class="card-title">${curr_date}</h5>
                                        <div class="icon">
                                            <img src="${icon}">
                                        </div>
                                        <p>Temp: ${daily[i].temp.day} ℉</p>
                                        <p>Wind: ${daily[i].wind_speed} MPH</p>
                                        <p>Humidity: ${daily[i].humidity} %</p>`;

                            card_body.innerHTML = markup;
                            card_div.append(card_body);
                            coldiv.append(card_div);
                            // append cards to main div
                            $('#forcast_data').append(coldiv)
                        }


                    }

                })
            }
        })

    .catch((e) => {
        console.log("Please search for a valid city 😩");
    });
}